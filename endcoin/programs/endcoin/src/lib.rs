use anchor_lang::prelude::*;

pub use errors::*;
pub mod errors;
pub use state::*;
pub mod state;
mod constants;

pub use ammconfig::*;
pub mod ammconfig;

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
    
    pub fn read_feed(ctx: Context<Switchboard>, params: ReadFeedParams) -> Result<()> {
        ctx.accounts.read_feed(params)?;
        Ok(())
    }
    pub fn read_history(ctx: Context<SwitchboardHistory>, params: ReadHistoryParams)  -> Result<()> {
        ctx.accounts.read_history(params)?;
        Ok(())
    }

    pub fn create_amm(ctx: Context<CreateAmm>, id: Pubkey, fee: u16) -> Result<()> {
        ctx.accounts.create_amm(id, fee)?;
        Ok(())
    }

    pub fn create_pool(ctx: Context<CreatePool>) -> Result<()> {
        ctx.accounts.create_pool()?;
        Ok(())
    }
    pub fn create_sst(ctx: Context<CreateSST>) -> Result<()> {
        ctx.accounts.create_sst()?;
        Ok(())
    }
    pub fn create_endcoin_metadata(ctx: Context<CreateMetadata>) -> Result<()> {
        ctx.accounts.create_endcoin_metadata(ctx.bumps)?;
        Ok(())
    }
    pub fn create_gaiacoin_metadata(ctx: Context<CreateMetadata>) -> Result<()> {
        ctx.accounts.create_gaiacoin_metadata(ctx.bumps)?;
        Ok(())
    }
    pub fn deposit_liquidity(
        ctx: Context<DepositLiquidity>,
        amount_a: u64,
        amount_b: u64,
    ) -> Result<()> {
        ctx.accounts.deposit_liquidity(amount_a, amount_b, &ctx.bumps)
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



#[derive(Accounts)]
pub struct Withdraw{}

#[derive(Accounts)]
pub struct Swap{}
