use anchor_lang::error_code;
use constant_product_curve::CurveError;

#[error_code]
pub enum AmmError {
    #[msg("Default Error")]
    DefaultError,
    #[msg("Fee is bigger than 100")]
    InvalidFee,
    #[msg("Invalid authority")]
    InvalidAuthority,
    #[msg("No authority set")]
    NoAuthoritySet,
    #[msg("Pool is locked")]
    PoolLocked,
    #[msg("Offer expired")]
    OfferExpired,
    #[msg("Zero balance")]
    ZeroBalance,
    #[msg("Slippage Exceeded")]
    SlippageExceeded,
}

impl From<CurveError> for AmmError {
    fn from(error: CurveError) -> AmmError {
        match error {
            _ => AmmError::DefaultError,
        }
    }
}