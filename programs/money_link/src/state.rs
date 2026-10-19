use anchor_lang::prelude::*;

#[account]
pub struct Escrow {
    pub sender: Pubkey,
    pub claim_pubkey: Pubkey,
    /// USDC base units (6 decimals).
    pub amount: u64,
    pub bump: u8,
}

impl Escrow {
    pub const LEN: usize = 32 + 32 + 8 + 1;
}
