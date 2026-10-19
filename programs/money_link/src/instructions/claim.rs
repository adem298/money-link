use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, TransferChecked};

use crate::{constants::{ESCROW_SEED, USDC_DECIMALS, USDC_MINT}, errors::MoneyLinkError, state::Escrow, EscrowClaimed};

#[derive(Accounts)]
pub struct ClaimEscrow<'info> {
    /// The ephemeral signing key whose public key was committed when the link was created.
    pub claim_authority: Signer<'info>,
    #[account(
        mut,
        close = sender,
        seeds = [ESCROW_SEED, escrow.sender.as_ref(), escrow.claim_pubkey.as_ref()],
        bump = escrow.bump,
        constraint = escrow.claim_pubkey == claim_authority.key() @ MoneyLinkError::WrongClaimKey
    )]
    pub escrow: Account<'info, Escrow>,
    /// Rent returned on close. The recipient of the USDC is selected separately.
    #[account(mut, address = escrow.sender)]
    pub sender: SystemAccount<'info>,
    #[account(
        mut,
        associated_token::mint = usdc_mint,
        associated_token::authority = escrow
    )]
    pub vault: Account<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = usdc_mint,
        constraint = destination.key() != vault.key() @ MoneyLinkError::DestinationIsVault
    )]
    pub destination: Account<'info, TokenAccount>,
    #[account(address = USDC_MINT)]
    pub usdc_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimEscrow>) -> Result<()> {
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
                to: ctx.accounts.destination.to_account_info(),
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

    emit!(EscrowClaimed {
        escrow: escrow_key,
        sender: sender_key,
        claim_pubkey: claim_key,
        destination: ctx.accounts.destination.key(),
        amount: vault_amount,
    });

    Ok(())
}
