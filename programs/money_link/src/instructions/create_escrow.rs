use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, Mint, Token, TokenAccount, TransferChecked},
};

use crate::{constants::{ESCROW_SEED, USDC_DECIMALS, USDC_MINT}, errors::MoneyLinkError, state::Escrow, EscrowCreated};

#[derive(Accounts)]
#[instruction(amount: u64, claim_pubkey: Pubkey)]
pub struct CreateEscrow<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(
        init,
        payer = sender,
        space = 8 + Escrow::LEN,
        seeds = [ESCROW_SEED, sender.key().as_ref(), claim_pubkey.as_ref()],
        bump
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = sender
    )]
    pub sender_token_account: Account<'info, TokenAccount>,
    #[account(
        init,
        payer = sender,
        associated_token::mint = usdc_mint,
        associated_token::authority = escrow
    )]
    pub vault: Account<'info, TokenAccount>,
    #[account(address = USDC_MINT)]
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<CreateEscrow>,
    amount: u64,
    claim_pubkey: Pubkey,
) -> Result<()> {
    require!(amount > 0, MoneyLinkError::AmountMustBePositive);
    require!(claim_pubkey != Pubkey::default(), MoneyLinkError::InvalidClaimKey);

    let escrow = &mut ctx.accounts.escrow;
    escrow.sender = ctx.accounts.sender.key();
    escrow.claim_pubkey = claim_pubkey;
    escrow.amount = amount;
    escrow.bump = ctx.bumps.escrow;

    token::transfer_checked(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.sender_token_account.to_account_info(),
                mint: ctx.accounts.usdc_mint.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
                authority: ctx.accounts.sender.to_account_info(),
            },
        ),
        amount,
        USDC_DECIMALS,
    )?;

    emit!(EscrowCreated {
        escrow: ctx.accounts.escrow.key(),
        sender: ctx.accounts.sender.key(),
        claim_pubkey,
        amount,
    });

    Ok(())
}
