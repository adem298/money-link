# Developer setup

The repository has two pieces: the Vite web prototype and an Anchor program in `programs/money_link`.

## Frontend

```sh
npm install
npm run dev
```

The browser app is still a local simulation. It has not yet been wired to the program or a wallet adapter.

## Solana / Anchor program

Install the Rust toolchain, Solana CLI, and Anchor CLI 0.31.1 first. The current agent environment does not have these tools installed, so the program has not been compiled or tested here.

1. Generate a program keypair in the ignored build directory, then sync its public key into `Anchor.toml` and `declare_id!`:

   ```sh
   mkdir -p target/deploy
   solana-keygen new --no-bip39-passphrase --outfile target/deploy/money_link-keypair.json
   anchor keys sync
   ```

   Keep the keypair private. Never commit it. The checked-in program address is a placeholder and has no corresponding deploy keypair.

2. Build the source for the selected mint:

   ```sh
   # Mainnet USDC is the default constant.
   anchor build

   # For Devnet, build with Circle's Devnet USDC mint instead.
   anchor build -- --features devnet-usdc
   ```

3. For any deployment, confirm that the selected feature, cluster, mint, program ID, upgrade authority, and frontend configuration all agree. Do not deploy the default build to a test cluster expecting Devnet USDC, or deploy the `devnet-usdc` build to Mainnet.

## Before local transaction tests

The checked-in Anchor config uses Localnet, but the program intentionally accepts only the selected canonical USDC mint. A local validator therefore needs a dedicated, test-only USDC mint setup or a properly isolated testing feature before positive create/claim/cancel tests can run. Do not weaken the production mint constraint just to make a test pass. The required integration tests are listed in the root README and have not been added yet.
