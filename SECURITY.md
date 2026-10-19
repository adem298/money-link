# Security notes

## Current status

The browser client is Devnet-only. It uses the connected wallet and public Devnet RPC for balance and escrow reads and prepares real transaction instructions. The create/claim/cancel flow is gated until a program is found at the configured address. The Anchor source has **not** been compiled, tested, audited, or deployed in this environment. The checked-in program ID is a placeholder, and no deploy keypair is included. Devnet USDC and SOL have no monetary value. Do not use this code with Mainnet funds.

The program source hardcodes classic SPL USDC: Mainnet by default, or Circle's Devnet mint only when built with the `devnet-usdc` Cargo feature. The program stores the sender, ephemeral claim public key, amount, and PDA bump. The claim instruction checks the PDA and claim signer, transfers to a same-mint token account, closes the vault, and closes the escrow; cancel requires the sender signer and returns the vault balance. These behaviors still need local-validator tests and independent review.

The browser creates an ephemeral keypair for each link. The private key is encoded in the URL fragment, held in memory by the sender, and is not sent to the RPC or saved by the app. The claim client verifies its public key against on-chain escrow state before submitting the claim. URL fragments are not included in the HTTP request for the page itself, but remain sensitive: browser history, screenshots, clipboard sync, compromised devices, and messaging previews are still risks.

## Required security work

- Test the on-chain account constraints and every malicious account combination, wrong mint, zero amount, unexpected vault balance, claim/cancel race, rent return, and duplicate action on a local validator.
- Confirm the destination token account is bound into the signed claim transaction. The current client constructs it from the connected recipient wallet and adds the associated-token-account instruction before claim.
- A real claim URL is a bearer credential: anyone who possesses the complete URL can claim the funds.
- Never send a private claim key to application servers, analytics, link-preview services, or logs. The fragment is one mitigation, not a complete solution.
- A future relayer should sponsor only validated claim instructions, simulate before signing, and apply abuse controls. The current client has no relayer; the claimant must pay Devnet SOL.
- Store the deploy keypair securely; configure a multisig upgrade authority and documented upgrade/revocation process. Verify the deployed binary matches reviewed source.
- There must be no Mainnet launch before independent security review, an operational key-management plan, and legal review for each launch corridor.

## Reporting

This project has no production deployment or funds at risk. Please do not report Devnet behavior as a vulnerability in a live financial service. Production security contacts and disclosure procedures must be established before a real-funds release.
