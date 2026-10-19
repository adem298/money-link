use anchor_lang::prelude::*;

pub const ESCROW_SEED: &[u8] = b"escrow";
pub const USDC_DECIMALS: u8 = 6;

// Mainnet USDC is the default. Build with `--features devnet-usdc` only when
// targeting Devnet; never use that feature for a mainnet deployment.
#[cfg(feature = "devnet-usdc")]
pub const USDC_MINT: Pubkey = pubkey!("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

#[cfg(not(feature = "devnet-usdc"))]
pub const USDC_MINT: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
