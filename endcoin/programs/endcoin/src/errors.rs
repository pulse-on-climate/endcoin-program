use anchor_lang::error_code;

#[error_code]
pub enum AmmError {
    #[msg("Invalid fee value")]
    InvalidFee,

    #[msg("Invalid mint for the pool")]
    InvalidMint,

    #[msg("Depositing too little liquidity")]
    DepositTooSmall,

    #[msg("Output is below the minimum expected")]
    OutputTooSmall,

    #[msg("Invariant does not hold")]
    InvariantViolated,

    #[msg("AMM Already Created")]
    AlreadyCreated
}

#[error_code]
pub enum SstError {
    #[msg("SST Already Initialized")]
    AlreadyInitialized,
}