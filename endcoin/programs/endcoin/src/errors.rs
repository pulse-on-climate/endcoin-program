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
    AlreadyCreated,
}

#[error_code]
pub enum SstError {
    #[msg("SST Already Initialized")]
    AlreadyInitialized,
}

#[error_code]
pub enum FeedData {
    #[msg("Invalid Feed Data")]
    InvalidFeedData,
}

#[error_code]
pub enum MetadataError {
    #[msg("Metadata Invalid")]
    InvalidMetadata,
}

#[error_code]
#[derive(Eq, PartialEq)]
pub enum SwitchboardClientError {
#[msg("Not a valid Switchboard account")]
InvalidSwitchboardAccount,
#[msg("Switchboard feed has not been updated in 5 minutes")]
StaleFeed,
#[msg("Switchboard feed exceeded provided confidence interval")]
ConfidenceIntervalExceeded,
#[msg("History buffer mismatch")]
InvalidHistoryBuffer,
}