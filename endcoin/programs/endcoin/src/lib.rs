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
    
    pub fn create_metadata(ctx: Context<Init>, name: String, symbol: String, uri: String) -> Result<()> {
        // Endcoin Metadata
        ctx.accounts.create_metadata("Endcoin".to_string(), "END".to_string(), "endcoin.com/cool-logo-end.png".to_string())?;
        // Gaiacoin Metadata
        ctx.accounts.create_metadata("Gaiacoin".to_string(), "GAIA".to_string(), "gaiacoin.com/cool-logo-gaia.png".to_string())
    }
    pub fn init(ctx: Context<Init>) -> Result<()> {
        ctx.accounts.init()
        
    }
    


    pub fn emit(ctx: Context<MintTokens>) -> Result<()> {

        Ok(())
    }
}
