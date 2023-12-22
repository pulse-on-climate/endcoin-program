use anchor_lang::prelude::*;

pub use errors::*;
pub mod errors;
pub use state::*;
pub mod state;
pub use contexts::*;
pub mod contexts;
declare_id!("AAc5RWfWdn24hN9mWRTQr18TcHz5JyPnjATwamaCZAiF");

#[program]
pub mod endcoin {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}
