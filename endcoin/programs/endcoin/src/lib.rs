use anchor_lang::prelude::*;

pub use errors::*;
pub mod errors;
pub use state::*;
pub mod state;
mod constants;

pub use contexts::*;
pub mod contexts;
declare_id!("Dm8CMAiXHEcpxsN1p69BGy1veoUvfTbCgjv9eiH3U7eH");

#[program]
pub mod endcoin {
    use super::*;
    

    pub fn init(ctx: Context<Init>) -> Result<()> {
        ctx.accounts.init()?;
        Ok(())
    }
    pub fn create_amm(ctx: Context<CreateAmm>, id: Pubkey, fee: u16) -> Result<()> {
        ctx.accounts.create_amm(id, fee)?;
        Ok(())
    }
    pub fn create_sst(ctx: Context<CreateSST>) -> Result<()> {
        ctx.accounts.create_sst()?;
        Ok(())
    }
    pub fn create_pool(ctx: Context<CreatePool>) -> Result<()> {
        ctx.accounts.create_pool(ctx.bumps)?;
        Ok(())
    }

    pub fn create_metadata(ctx: Context<CreateMetadata>, token: u8) -> Result<()> {
        ctx.accounts.create_metadata(token, ctx.bumps)?;
        Ok(())
    }

    pub fn read_feed(ctx: Context<Switchboard>, params: ReadFeedParams) -> Result<()> {
        ctx.accounts.read_feed(params)?;
        Ok(())
    }
    pub fn deposit_liquidity(
        ctx: Context<DepositLiquidity>, mean_temp: f64
    ) -> Result<()> {
        ctx.accounts.deposit_liquidity(&ctx.bumps, mean_temp)
    }

    
    pub fn swap_exact_tokens_for_tokens(
        ctx: Context<SwapExactTokensForTokens>,
        swap_a: bool,
        input_amount: u64,
        min_output_amount: u64,
    ) -> Result<()> {
        ctx.accounts.swap_exact_tokens_for_tokens(swap_a, input_amount, min_output_amount, &ctx.bumps)
    }
}
