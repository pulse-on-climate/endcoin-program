use anchor_lang::prelude::*;

pub use errors::*;
pub mod errors;
pub use state::*;
pub mod state;
pub use contexts::*;
pub mod contexts;
declare_id!("92ovUpDZiVec1p9fNJczGMd73jbHG5dBkkSbd5Hm6QYz");

#[program]
pub mod endcoin {
    use super::*;
    

    pub fn init(ctx: Context<Init>) -> Result<()> {
        msg!("We're Initing!");
        let _ = ctx.accounts.init(&ctx.bumps);
        Ok(())
    }
    
    // pub fn create_endcoin_metadata(ctx: Context<Init>, name: String, symbol: String, uri: String) -> Result<()> {
    //     ctx.accounts.create_endcoin_metadata();
    //     Ok(())
    // }

    pub fn emit(ctx: Context<MintTokens>) -> Result<()> {

        Ok(())
    }
}
