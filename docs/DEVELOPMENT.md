# Developer setup

The repository contains a Vite client and an Anchor program. The client is Devnet-only and has no local mock balance. It reads the connected wallet's test-USDC balance from Devnet. Create, claim, and cancel remain disabled until the Anchor program is deployed at the configured program ID.

## Frontend

```sh
npm install
npm run dev
```

Open `http://localhost:5173` and connect Phantom, Solflare, or another injected Solana wallet configured for **Devnet**. The client is intentionally pinned to `https://api.devnet.solana.com` and Circle's Devnet USDC mint; there is no RPC/network override. After deployment, create `.env.local` with the program public key:

```env
VITE_PROGRAM_ID=YOUR_DEPLOYED_PROGRAM_PUBLIC_KEY
```

Restart Vite after editing `.env.local`. Do not put a seed phrase, private key, or keypair secret in any `VITE_` variable.

## Build and deploy the Devnet program

Install Rust, Solana CLI, and Anchor CLI 0.31.1. They are not installed in the current agent environment, so the program source and on-chain client instructions have not yet been compiled or integration-tested here.

1. Generate a program keypair, synchronize its public key into `Anchor.toml` and `declare_id!`, then build the Devnet version:

   ```sh
   mkdir -p target/deploy
   solana-keygen new --no-bip39-passphrase --outfile target/deploy/money_link-keypair.json
   anchor keys sync
   anchor build -- --features devnet-usdc
   ```

   Keep the deploy keypair private. Never commit it. The checked-in program ID is a placeholder and has no corresponding keypair.

2. Configure a Devnet wallet you control, fund it with Devnet SOL, and deploy the feature-matched build:

   ```sh
   solana config set --url devnet
   anchor deploy --provider.cluster devnet
   ```

3. Copy the address shown by `anchor keys list` into `.env.local` as `VITE_PROGRAM_ID`, then restart the Vite server. The frontend checks that the configured account is an executable program before enabling escrow actions.

4. Obtain Circle Devnet USDC for your wallet. Both test USDC and Devnet SOL have no monetary value. The claim transaction is currently paid by the recipient wallet; a sponsored relayer is not implemented.

## Before broader testing or production

The current source has not been built or tested. Add a local-validator setup with a test-only USDC mint, then verify successful create/claim/cancel, wrong claim key, wrong mint, zero amount, invalid account substitution, destination mint/authority behavior, rent return, unexpected vault balance, duplicate actions, and claim/cancel races. Do not weaken the production mint constraint for tests. Production also requires independent audit, reviewed deployment artifacts, secure multisig upgrade authority, a relayer design, and jurisdiction-specific legal review.
