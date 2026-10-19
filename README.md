# Money Link

Money Link is a responsive prototype for sending USDC with a private claim link. It is based on the product brief in the attached `claim-link-remittance-app.txt` and demonstrates the sender dashboard, link creation, share, claim, cancellation, and activity flows.

> **Prototype only:** this repository currently contains a front-end simulation. It does not connect to Solana, sign transactions, use a real wallet, or move real USDC. The demo balance and all transfer results are local to the browser.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. To verify a production build:

```sh
npm run build
npm run preview
```

## Try the flow

1. From **Overview**, choose **Create a link**.
2. Enter an amount, optionally add a recipient and note, then create the link.
3. Copy or share the link. **Preview the claim page** opens the receiver flow in the same browser.
4. Claim the link, or return to **My links** and cancel it while it is still pending.
5. Review status changes in **Activity**. Use the demo-wallet menu to reset the local sandbox.

The initial sandbox balance is 2,500.00 demo USDC. Link metadata and activity are kept in `localStorage`; the random 256-bit claim secret is not. It is held in memory for the active browser session and appears only in the link's URL fragment. The browser stores a SHA-256 digest to validate a claim. A refresh or a different browser session loses the ability to reconstruct an unshared link.

## Current scope

- Responsive React + Vite app with local, browser-only demo state.
- Secure random claim-link secrets, URL-fragment handling, hash verification, demo claim, cancel/refund, and activity history.
- No external font, analytics, wallet, RPC, relayer, or API requests are required by the app.

Not implemented yet: the Anchor program and its tests, Solana wallet adapters, the USDC mint/account flow, sponsored claim transactions, embedded wallets/passkeys, a shared backend, and on/off-ramp integrations. These are required before this product can handle real funds.

## Before using real funds

Build and test the Anchor escrow program against the chosen USDC mint; verify every account constraint and claim/cancel race; add wallet and destination-token-account handling; implement a claim-only relayer; arrange independent security review and jurisdiction-specific legal review; then validate one real remittance corridor and its off-ramp. Do not treat this UI prototype as custody or payment software.
