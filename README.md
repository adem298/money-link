# Money Link

Money Link is a Solana Devnet app for sending classic SPL USDC through an on-chain escrow and a private claim link.

> **Devnet only; not production-ready.** The current frontend connects to an injected Solana wallet, reads the connected wallet’s Devnet USDC balance, and builds real Devnet transactions. The Anchor program must be deployed and configured before create/claim/cancel can run. Devnet tokens have no monetary value. Mainnet is intentionally not supported by this frontend.

## Run the app

```sh
npm install
npm run dev
```

Open `http://localhost:5173` and connect Phantom, Solflare, or another compatible browser wallet configured for Devnet. Use test USDC and Devnet SOL only. Run `npm test` for the client instruction/account-layout tests and `npm run build` for the frontend bundle.

The client is pinned to the public Solana Devnet RPC and Devnet USDC mint. It reads only `VITE_PROGRAM_ID` from `.env.local`; until configured, it uses the non-deployed placeholder program ID. After deployment, set the program public key in `.env.local` and restart Vite. See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

## On-chain flow

- **Create:** generate an ephemeral Ed25519 keypair in the browser, derive the escrow PDA, and submit `create_escrow`. The sender’s wallet signs the USDC deposit. The private key is encoded in the link fragment and is never sent to the RPC or stored by the app.
- **Claim:** load escrow data from Devnet, validate the private key against its on-chain claim public key, create the recipient’s associated token account if needed, and submit `claim`. The recipient's wallet and ephemeral link key both sign. The recipient pays Devnet transaction fees; a sponsored relayer is not implemented.
- **Cancel:** the original sender signs `cancel`; USDC returns to their associated token account and the vault/escrow are closed.
- **My links:** fetch open escrow accounts for the connected sender directly from the configured program.

The program source is in `programs/money_link`. It uses the canonical Mainnet USDC mint by default and Circle's Devnet USDC mint when built with `--features devnet-usdc`. The frontend is configured for Devnet only.

## Not production-ready

The Anchor program has not been compiled or run in a validator in this environment; Rust, Solana CLI, and Anchor CLI are not installed here. The program address checked into source/config is a placeholder with no deploy keypair. The transaction builders and account layouts also need local-validator integration tests against the program before a Devnet deployment.

The full release gate is tracked in [docs/PRODUCTION_READINESS.md](docs/PRODUCTION_READINESS.md). Frontend unit tests and a successful bundle build do not certify the on-chain program. Do not use this code for real-value transfers yet.
