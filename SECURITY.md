# Security notes

## Current status

The browser app is still a local demo with fictional balances; it has no production wallet connection, RPC integration, backend, or relayer. An initial Anchor escrow program now exists under `programs/money_link`, but it has **not** been compiled, run in a validator, audited, or deployed. Its checked-in program ID is a placeholder and has no deploy keypair. Do not use this code with real funds yet.

The program source hardcodes canonical classic SPL USDC: Mainnet by default, or Circle's Devnet mint only when built with the `devnet-usdc` Cargo feature. The program stores the sender, ephemeral claim public key, amount, and PDA bump. The claim instruction checks the PDA and claim signer, transfers to a same-mint token account, closes the vault, and closes the escrow; cancel requires the sender signer and returns the vault balance. These are implementation intentions that still need test coverage and independent review.

The browser demo creates a 256-bit random secret with Web Crypto. The secret is placed after `#` in the claim URL, held in React memory for the active session, and never written to local storage. A SHA-256 digest is stored with the local demo escrow so the claim page can verify the fragment. The fragment is not included in the HTTP request for the page itself. Demo links and state are browser-local and cannot be claimed from another browser profile.

## Product security assumptions and required work

- A real claim URL is a bearer credential: anyone who possesses the complete URL can claim the funds.
- A private key or claim secret must never be sent to application servers, analytics, link-preview services, or logs. The URL fragment is one mitigation, not a complete solution; browser history, screenshots, clipboard sync, compromised devices, and chat previews remain risks.
- Test the on-chain account constraints and every malicious account combination, wrong mint, zero amount, unexpected vault balance, claim/cancel race, and rent return on a local validator before deployment.
- The recipient destination must be bound into the signed claim transaction. The client should create the recipient's associated token account in the same transaction, paid for by the relayer when applicable.
- A relayer should sponsor only validated claim instructions, simulate before signing, and apply abuse controls. It must not be trusted to redirect the destination.
- Store the deploy keypair securely; configure a multisig upgrade authority and a documented upgrade/revocation process. Verify the deployed build matches reviewed source.
- There must be no real-funds launch before independent review, an operational key-management plan, and legal review for each launch corridor.

## Reporting

This project has no production deployment or funds at risk. Please do not report demo behavior as a vulnerability in a live financial service. Production security contacts and disclosure procedures must be established before a real-funds release.
