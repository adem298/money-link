import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

const viteEnv = import.meta.env || {};

export const NETWORK = 'devnet';
export const USDC_DECIMALS = 6;
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');
export const USDC_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
export const PLACEHOLDER_PROGRAM_ID = 'Aq5AQv1znmkFn5Kbr7wrdgvEvko5ppcLD7ShnaEGGFaR';
export const PROGRAM_ID = new PublicKey(viteEnv.VITE_PROGRAM_ID || PLACEHOLDER_PROGRAM_ID);
export const RPC_URL = clusterApiUrl(NETWORK);
export const connection = new Connection(RPC_URL, 'confirmed');
const encoder = new TextEncoder();

function concatBytes(...parts) {
  const size = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

export async function anchorDiscriminator(namespace, instructionName) {
  const input = encoder.encode(`${namespace}:${instructionName}`);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', input);
  return new Uint8Array(digest).slice(0, 8);
}

function u64LittleEndian(value) {
  const bytes = new Uint8Array(8);
  new DataView(bytes.buffer).setBigUint64(0, BigInt(value), true);
  return bytes;
}

export function parseUsdcAmount(value) {
  const input = String(value).trim();
  if (!/^\d+(?:\.\d{1,6})?$/.test(input)) {
    throw new Error('Enter an amount with up to six decimal places.');
  }
  const [whole, fraction = ''] = input.split('.');
  const amount = BigInt(whole) * 1_000_000n + BigInt(fraction.padEnd(6, '0') || '0');
  if (amount <= 0n) throw new Error('Amount must be greater than zero.');
  if (amount > (1n << 64n) - 1n) throw new Error('Amount exceeds the supported USDC range.');
  return amount;
}

export function formatUsdcAmount(amount, minimumDecimals = 2) {
  const units = BigInt(amount ?? 0);
  const whole = units / 1_000_000n;
  const fractional = (units % 1_000_000n).toString().padStart(6, '0');
  const trimmed = fractional.replace(/0+$/, '');
  const fraction = trimmed.padEnd(Math.max(0, minimumDecimals), '0');
  const grouped = whole.toLocaleString('en-US');
  if (fraction) return `${grouped}.${fraction}`;
  return minimumDecimals > 0 ? `${grouped}.${'0'.repeat(minimumDecimals)}` : grouped;
}

export function encodeSecret(secretKey) {
  let binary = '';
  for (const byte of secretKey) binary += String.fromCharCode(byte);
  return globalThis.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function decodeSecret(encoded) {
  const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const binary = globalThis.atob(normalized + '='.repeat((4 - (normalized.length % 4)) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function deriveEscrowAddress(sender, claimPublicKey, programId = PROGRAM_ID) {
  const [escrow] = PublicKey.findProgramAddressSync(
    [encoder.encode('escrow'), sender.toBuffer(), claimPublicKey.toBuffer()],
    programId,
  );
  return escrow;
}

function getAssociatedTokenAddress(owner) {
  const [address] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), USDC_MINT.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  );
  return address;
}

export function getVaultAddress(escrow) {
  return getAssociatedTokenAddress(escrow);
}

export function getWalletUsdcAddress(wallet) {
  return getAssociatedTokenAddress(wallet);
}

export function makeAtaInstruction(payer, owner) {
  return new TransactionInstruction({
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: getWalletUsdcAddress(owner), isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: USDC_MINT, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Uint8Array.of(1),
  });
}

export async function makeCreateEscrowInstruction({ sender, claimPublicKey, amount }) {
  const escrow = deriveEscrowAddress(sender, claimPublicKey);
  const senderTokenAccount = getWalletUsdcAddress(sender);
  const vault = getVaultAddress(escrow);
  const discriminator = await anchorDiscriminator('global', 'create_escrow');
  const data = concatBytes(discriminator, u64LittleEndian(amount), claimPublicKey.toBytes());

  return {
    escrow,
    vault,
    senderTokenAccount,
    instruction: new TransactionInstruction({
      programId: PROGRAM_ID,
      keys: [
        { pubkey: sender, isSigner: true, isWritable: true },
        { pubkey: escrow, isSigner: false, isWritable: true },
        { pubkey: senderTokenAccount, isSigner: false, isWritable: true },
        { pubkey: vault, isSigner: false, isWritable: true },
        { pubkey: USDC_MINT, isSigner: false, isWritable: false },
        { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
      ],
      data,
    }),
  };
}

export async function makeClaimInstruction({ claimAuthority, escrow, sender, destination }) {
  const vault = getVaultAddress(escrow);
  const destinationTokenAccount = getWalletUsdcAddress(destination);
  const discriminator = await anchorDiscriminator('global', 'claim');
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: claimAuthority, isSigner: true, isWritable: false },
      { pubkey: escrow, isSigner: false, isWritable: true },
      { pubkey: sender, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: destinationTokenAccount, isSigner: false, isWritable: true },
      { pubkey: USDC_MINT, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: discriminator,
  });
}

export async function makeCancelInstruction({ sender, escrow }) {
  const senderTokenAccount = getWalletUsdcAddress(sender);
  const vault = getVaultAddress(escrow);
  const discriminator = await anchorDiscriminator('global', 'cancel');
  return new TransactionInstruction({
    programId: PROGRAM_ID,
    keys: [
      { pubkey: sender, isSigner: true, isWritable: true },
      { pubkey: escrow, isSigner: false, isWritable: true },
      { pubkey: senderTokenAccount, isSigner: false, isWritable: true },
      { pubkey: vault, isSigner: false, isWritable: true },
      { pubkey: USDC_MINT, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: discriminator,
  });
}

export async function decodeEscrowAccount(data) {
  const expectedDiscriminator = await anchorDiscriminator('account', 'Escrow');
  if (data.length < 81 || !expectedDiscriminator.every((byte, index) => data[index] === byte)) {
    throw new Error('This account is not a Money Link escrow.');
  }
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  return {
    sender: new PublicKey(data.slice(8, 40)),
    claimPublicKey: new PublicKey(data.slice(40, 72)),
    amount: view.getBigUint64(72, true),
    bump: data[80],
  };
}

export async function fetchOpenEscrows(sender) {
  const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
    commitment: 'confirmed',
    filters: [
      { dataSize: 81 },
      { memcmp: { offset: 8, bytes: sender.toBase58() } },
    ],
  });
  const entries = await Promise.all(accounts.map(async ({ pubkey, account }) => ({
    address: pubkey,
    ...(await decodeEscrowAccount(account.data)),
  })));
  return entries.sort((a, b) => (a.address.toBase58() < b.address.toBase58() ? -1 : 1));
}

export async function sendWalletTransaction({ provider, wallet, instructions, signers = [] }) {
  const latest = await connection.getLatestBlockhash('confirmed');
  const transaction = new Transaction({
    feePayer: wallet,
    recentBlockhash: latest.blockhash,
  }).add(...instructions);
  if (signers.length) transaction.partialSign(...signers);
  const signedTransaction = await provider.signTransaction(transaction);
  const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
    preflightCommitment: 'confirmed',
    maxRetries: 3,
  });
  const confirmation = await connection.confirmTransaction({
    signature,
    blockhash: latest.blockhash,
    lastValidBlockHeight: latest.lastValidBlockHeight,
  }, 'confirmed');
  if (confirmation.value.err) throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
  return signature;
}
