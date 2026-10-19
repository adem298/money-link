# Security notes

## What this repository does today

The current Money Link app is a front-end demo. It has no production wallet, RPC connection, Anchor program, relayer, backend, or real funds. Its sandbox balance is fictional. Do not use it to send or receive money.

The demo creates a 256-bit random secret with the browser Web Crypto API. The secret is placed after `#` in the claim URL, held in React memory for the active session, and never written to local storage. A SHA-256 digest is stored with the local demo escrow so the claim page can verify the fragment. The fragment is not included in the HTTP request for the page itself. Demo links and state are browser-local and cannot be claimed from another browser profile.

## Product security assumptions

- A real claim URL is a bearer credential: anyone who possesses the complete URL can claim the funds.
- A private key or claim secret must never be sent to application servers, analytics, link-preview services, or logs. The URL fragment is one mitigation, not a complete solution; browser history, screenshots, clipboard sync, compromised devices, and chat previews remain risks.
- An on-chain implementation must validate the escrow PDA, sender, claim authority, vault owner, USDC mint, destination mint, and token program. Claim and cancel must be atomic so that at most one can succeed.
- A relayer should sponsor only validated claim instructions, simulate before signing, and apply abuse controls. It must not be trusted to redirect the destination.
- There must be no real-funds launch before independent review, tests of malicious account combinations and claim/cancel races, an operational key-management plan, and legal review for each launch corridor.

## Reporting

This prototype has no production deployment or funds at risk. Please do not report demo behavior as a vulnerability in a live financial service. Production security contacts and disclosure procedures must be established before a real-funds release.
