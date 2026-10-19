import test from 'node:test';
import assert from 'node:assert/strict';
import { Keypair, PublicKey } from '@solana/web3.js';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  USDC_MINT,
  anchorDiscriminator,
  decodeEscrowAccount,
  decodeSecret,
  deriveEscrowAddress,
  encodeSecret,
  formatUsdcAmount,
  getVaultAddress,
  getWalletUsdcAddress,
  makeAtaInstruction,
  makeCancelInstruction,
  makeClaimInstruction,
  makeCreateEscrowInstruction,
  parseUsdcAmount,
} from '../src/lib/solana.js';

const asBytes = (value) => [...value];

test('USDC amount parsing uses exact six-decimal base units', () => {
  assert.equal(parseUsdcAmount('1'), 1_000_000n);
  assert.equal(parseUsdcAmount('0.000001'), 1n);
  assert.equal(parseUsdcAmount('1250.45'), 1_250_450_000n);
  assert.throws(() => parseUsdcAmount('0'), /greater than zero/);
  assert.throws(() => parseUsdcAmount('1.0000001'), /six decimal places/);
  assert.throws(() => parseUsdcAmount('18446744073709.551616'), /supported USDC range/);
});

test('USDC formatting preserves non-zero precision and whole amounts', () => {
  assert.equal(formatUsdcAmount(0n), '0.00');
  assert.equal(formatUsdcAmount(1_000_000n), '1.00');
  assert.equal(formatUsdcAmount(1_234_567_890n), '1,234.56789');
  assert.equal(formatUsdcAmount(25_000_000n, 0), '25');
  assert.equal(formatUsdcAmount(25_500_000n, 0), '25.5');
});

test('claim secrets round-trip using URL-safe base64 without padding', () => {
  const secret = Keypair.generate().secretKey;
  const encoded = encodeSecret(secret);
  assert.match(encoded, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(asBytes(decodeSecret(encoded)), asBytes(secret));
});

test('escrow PDA and token accounts derive deterministically', () => {
  const sender = Keypair.generate().publicKey;
  const claim = Keypair.generate().publicKey;
  const first = deriveEscrowAddress(sender, claim);
  const second = deriveEscrowAddress(sender, claim);
  assert.ok(first.equals(second));
  assert.ok(getVaultAddress(first).equals(getVaultAddress(first)));
  assert.ok(getWalletUsdcAddress(sender).equals(getWalletUsdcAddress(sender)));
  assert.equal(USDC_MINT.toBase58(), '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
});

test('create instruction encodes Anchor discriminator, u64 amount, and claim key', async () => {
  const sender = Keypair.generate().publicKey;
  const claim = Keypair.generate().publicKey;
  const amount = 7_654_321n;
  const result = await makeCreateEscrowInstruction({ sender, claimPublicKey: claim, amount });
  const { instruction } = result;
  const expectedDiscriminator = await anchorDiscriminator('global', 'create_escrow');
  assert.deepEqual(asBytes(instruction.data.slice(0, 8)), asBytes(expectedDiscriminator));
  assert.equal(new DataView(instruction.data.buffer, instruction.data.byteOffset + 8, 8).getBigUint64(0, true), amount);
  assert.deepEqual(asBytes(instruction.data.slice(16)), asBytes(claim.toBytes()));
  assert.ok(result.escrow.equals(deriveEscrowAddress(sender, claim)));
  assert.equal(instruction.keys.length, 9);
  assert.ok(instruction.keys[0].pubkey.equals(sender));
  assert.ok(instruction.keys[1].pubkey.equals(result.escrow));
  assert.ok(instruction.keys[3].pubkey.equals(result.vault));
  assert.ok(instruction.keys[4].pubkey.equals(USDC_MINT));
  assert.ok(instruction.keys[5].pubkey.equals(TOKEN_PROGRAM_ID));
  assert.ok(instruction.keys[6].pubkey.equals(ASSOCIATED_TOKEN_PROGRAM_ID));
  assert.equal(instruction.keys[0].isSigner, true);
});

test('claim instruction requires the ephemeral signer and binds the destination ATA', async () => {
  const sender = Keypair.generate().publicKey;
  const recipient = Keypair.generate().publicKey;
  const claimAuthority = Keypair.generate().publicKey;
  const escrow = deriveEscrowAddress(sender, claimAuthority);
  const instruction = await makeClaimInstruction({ claimAuthority, escrow, sender, destination: recipient });
  const discriminator = await anchorDiscriminator('global', 'claim');
  assert.deepEqual(asBytes(instruction.data), asBytes(discriminator));
  assert.equal(instruction.keys.length, 7);
  assert.ok(instruction.keys[0].pubkey.equals(claimAuthority));
  assert.equal(instruction.keys[0].isSigner, true);
  assert.ok(instruction.keys[1].pubkey.equals(escrow));
  assert.ok(instruction.keys[2].pubkey.equals(sender));
  assert.ok(instruction.keys[4].pubkey.equals(getWalletUsdcAddress(recipient)));
});

test('cancel instruction requires the sender signature', async () => {
  const sender = Keypair.generate().publicKey;
  const claim = Keypair.generate().publicKey;
  const escrow = deriveEscrowAddress(sender, claim);
  const instruction = await makeCancelInstruction({ sender, escrow });
  const discriminator = await anchorDiscriminator('global', 'cancel');
  assert.deepEqual(asBytes(instruction.data), asBytes(discriminator));
  assert.equal(instruction.keys.length, 6);
  assert.ok(instruction.keys[0].pubkey.equals(sender));
  assert.equal(instruction.keys[0].isSigner, true);
  assert.ok(instruction.keys[1].pubkey.equals(escrow));
  assert.ok(instruction.keys[2].pubkey.equals(getWalletUsdcAddress(sender)));
  assert.ok(instruction.keys[3].pubkey.equals(getVaultAddress(escrow)));
});

test('associated-token idempotent instruction uses the expected program and account metas', () => {
  const payer = Keypair.generate().publicKey;
  const owner = Keypair.generate().publicKey;
  const instruction = makeAtaInstruction(payer, owner);
  assert.ok(instruction.programId.equals(ASSOCIATED_TOKEN_PROGRAM_ID));
  assert.deepEqual(asBytes(instruction.data), [1]);
  assert.equal(instruction.keys.length, 6);
  assert.ok(instruction.keys[0].pubkey.equals(payer));
  assert.ok(instruction.keys[1].pubkey.equals(getWalletUsdcAddress(owner)));
  assert.ok(instruction.keys[2].pubkey.equals(owner));
});

test('escrow account decoder checks discriminator and parses the account layout', async () => {
  const sender = Keypair.generate().publicKey;
  const claim = Keypair.generate().publicKey;
  const amount = 42_123_456n;
  const data = new Uint8Array(81);
  data.set(await anchorDiscriminator('account', 'Escrow'), 0);
  data.set(sender.toBytes(), 8);
  data.set(claim.toBytes(), 40);
  new DataView(data.buffer).setBigUint64(72, amount, true);
  data[80] = 253;

  const decoded = await decodeEscrowAccount(data);
  assert.ok(decoded.sender.equals(sender));
  assert.ok(decoded.claimPublicKey.equals(claim));
  assert.equal(decoded.amount, amount);
  assert.equal(decoded.bump, 253);
  await assert.rejects(() => decodeEscrowAccount(new Uint8Array(81)), /not a Money Link escrow/);
});

test('configured IDs are valid Solana public keys', () => {
  assert.ok(new PublicKey(PROGRAM_ID.toBase58()).equals(PROGRAM_ID));
});
