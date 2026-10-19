use anchor_lang::prelude::*;

#[error_code]
pub enum MoneyLinkError {
    #[msg("The transfer amount must be greater than zero.")]
    AmountMustBePositive,
    #[msg("The claim public key cannot be the default public key.")]
    InvalidClaimKey,
    #[msg("The signing key does not match this escrow's claim key.")]
    WrongClaimKey,
    #[msg("The escrow vault contains less than the recorded amount.")]
    EscrowBalanceTooLow,
    #[msg("The escrow vault cannot also be the claim destination.")]
    DestinationIsVault,
}
