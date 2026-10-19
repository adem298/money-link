# Money Link

Money Link is a shareable-claim flow for USDC on Solana. This branch now includes the first Anchor escrow-program implementation as well as the original responsive web prototype.

> **Not ready for real funds.** The web UI still runs in local demo mode. The new Anchor source has not been compiled, tested, audited, or deployed in this environment; the configured program address is a placeholder. No wallet is connected and no transaction is sent by the UI.

## What exists

- **Web prototype:** Overview, send-link form, share/claim preview, cancel/refund flow, and activity history. Browser-local sample balances only.
- **Anchor program source:** `create_escrow`, `claim`, and `cancel` instructions for a PDA-owned classic SPL Token USDC vault. Mainnet USDC is the default mint; the Devnet USDC mint is available through the `devnet-usdc` Cargo feature.
- **Developer setup notes:** See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) before building or deploying the program.

## Run the web prototype

```sh
npm install
npm run dev
```

To verify the front-end bundle:

```sh
npm run build
```

The initial sandbox balance is 2,500.00 demo USDC. Link metadata and activity are stored in `localStorage`; the random claim secret is held in memory for the active session and appears only in the link's URL fragment. The browser stores a SHA-256 digest to validate a demo claim. The frontend does not yet construct or sign Solana transactions.

## Program status

The escrow code is an initial implementation, not an audited payment system. Before a real-funds release, the project still needs:

1. A generated program keypair and synchronized program ID (the current ID is deliberately a placeholder).
2. An Anchor/Solana toolchain and a working local-validator test harness, including a local USDC mint fixture.
3. Tests for correct and incorrect claim keys, wrong mints, zero amounts, account substitution, close/rent behavior, cancel authorization, and claim/cancel races.
4. Wallet connection and transaction construction in the frontend, destination ATA creation in the claim transaction, and a narrowly scoped claim relayer if sponsor-paid fees are required.
5. Independent security review, key-management procedures, and legal review for the first remittance corridor.

Do not deploy this program with real funds until those items are completed and reviewed.
