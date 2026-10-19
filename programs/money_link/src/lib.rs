use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

use instructions::{CancelEscrow, ClaimEscrow, CreateEscrow};

// Placeholder only: generate the deployment keypair and run `anchor keys sync` before building.
declare_id!("Aq5AQv1znmkFn5Kbr7wrdgvEvko5ppcLD7ShnaEGGFaR");

#[program]
pub mod money_link {
    use super::*;

    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        amount: u64,
        claim_pubkey: Pubkey,
    ) -> Result<()> {
        instructions::create_escrow::handler(ctx, amount, claim_pubkey)
    }

    pub fn claim(ctx: Context<ClaimEscrow>) -> Result<()> {
        instructions::claim::handler(ctx)
    }

    pub fn cancel(ctx: Context<CancelEscrow>) -> Result<()> {
        instructions::cancel::handler(ctx)
    }
}

#[event]
pub struct EscrowCreated {
    pub escrow: Pubkey,
    pub sender: Pubkey,
    pub claim_pubkey: Pubkey,
    pub amount: u64,
}

#[event]
pub struct EscrowClaimed {
    pub escrow: Pubkey,
    pub sender: Pubkey,
    pub claim_pubkey: Pubkey,
    pub destination: Pubkey,
    pub amount: u64,
}

#[event]
pub struct EscrowCancelled {
    pub escrow: Pubkey,
    pub sender: Pubkey,
    pub amount: u64,
}
