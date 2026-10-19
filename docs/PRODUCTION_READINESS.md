# Production-readiness gate

**Status: BLOCKED — do not use Mainnet or real-value funds.** This document is a release gate, not a security approval.

## Implemented so far

- Devnet-only browser client, fixed to Devnet RPC and Devnet USDC.
- Wallet-signing create/claim/cancel transaction builders.
- Ephemeral claim key held in the URL fragment, not persisted by the app.
- Client unit tests for amount conversion, account decoding, PDA/ATA derivation, instruction discriminators, and instruction account metas.
- Anchor escrow source for the three lifecycle instructions.

## Required before any real-funds pilot

- [ ] Pin a complete toolchain and compile the Anchor program reproducibly.
- [ ] Add and pass local-validator tests for successful create/claim/cancel, wrong signer/mint, zero amount, account substitution, rent, frozen accounts, unexpected vault balances, duplicate actions, and claim/cancel races.
- [ ] Compare the checked-in client builders to the generated IDL and test every instruction against the built program.
- [ ] Deploy to Devnet using a dedicated key, then exercise end-to-end create/share/claim/cancel with test tokens and multiple wallet providers.
- [ ] Independent Solana security audit and remediation review; fuzz/invariant testing of the escrow state machine.
- [ ] Review the claim-secret threat model, links/preview leakage, browser storage, referrer policy, XSS exposure, dependency updates, RPC/provider trust, and incident response.
- [ ] Configure and verify a multisig upgrade authority, deployment reproducibility, monitoring, emergency pause/recovery plan, and operational key custody.
- [ ] Choose and validate a single corridor, obtain legal/compliance review for all relevant jurisdictions, and confirm a working compliant off-ramp.
- [ ] Implement and review a narrowly scoped claim relayer if recipients are not expected to pay transaction fees.
- [ ] Create a separate Mainnet build/configuration with explicit release approvals; the current frontend intentionally has no Mainnet switch.

A passing frontend build or unit-test suite does not satisfy these gates. The current Anchor source has not been compiled, and no program has been deployed or audited.
