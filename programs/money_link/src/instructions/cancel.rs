use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, TransferChecked};

use crate::{constants::{ESCROW_SEED, USDC_DECIMALS, USDC_MINT}, errors::MoneyLinkError, state::Escrow, EscrowCancelled};

#[derive(Accounts)]
pub struct CancelEscrow<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    #[account(
        mut,
        close = sender,
        seeds = [ESCROW_SEED, sender.key().as_ref(), escrow.claim_pubkey.as_ref()],
        bump = escrow.bump,
        has_one = sender
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = sender
    )]
    pub sender_token_account: Account<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = escrow
    )]
    pub vault: Account<'info, TokenAccount>,
    #[account(address = USDC_MINT)]
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<CancelEscrow>) -> Result<()> {
    let escrow = &ctx.accounts.escrow;
    let vault_amount = ctx.accounts.vault.amount;
    require!(vault_amount >= escrow.amount, MoneyLinkError::EscrowBalanceTooLow);

    let sender_key = escrow.sender;
    let claim_key = escrow.claim_pubkey;
    let escrow_key = ctx.accounts.escrow.key();
    let bump_seed = [escrow.bump];
    let signer_seeds: &[&[u8]] = &[
        ESCROW_SEED,
        sender_key.as_ref(),
        claim_key.as_ref(),
        &bump_seed,
    ];
    let signer = &[signer_seeds];

    token::transfer_checked(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            TransferChecked {
                from: ctx.accounts.vault.to_account_info(),
                mint: ctx.accounts.usdc_mint.to_account_info(),
                to: ctx.accounts.sender_token_account.to_account_info(),
                authority: ctx.accounts.escrow.to_account_info(),
            },
            signer,
        ),
        vault_amount,
        USDC_DECIMALS,
    )?;

    token::close_account(CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        CloseAccount {
            account: ctx.accounts.vault.to_account_info(),
            destination: ctx.accounts.sender.to_account_info(),
            authority: ctx.accounts.escrow.to_account_info(),
        },
        signer,
    ))?;

    emit!(EscrowCancelled {
        escrow: escrow_key,
        sender: sender_key,
        amount: vault_amount,
    });

    Ok(())
}
