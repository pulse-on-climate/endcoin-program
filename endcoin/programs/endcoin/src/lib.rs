use anchor_lang::prelude::*;

pub use errors::*;
pub mod errors;
pub use state::*;
pub mod state;
mod constants;

pub use contexts::*;
pub mod contexts;


declare_id!("3fVWRMNHVjxZgwsgioTBVbLpAx1jxUu4xMoDoQZZbVUK");

#[program]
pub mod endcoin {
    use super::*;

    pub fn create_amm(ctx: Context<CreateAmm>, id: Pubkey, fee: u16) -> Result<()> {
        // Validate fee is within acceptable range (0-100%)
        require!(fee <= 10000, AmmError::InvalidFee); // 10000 = 100.00%
        ctx.accounts.create_amm(id, fee)?;
        Ok(())
    }

    pub fn create_sst(ctx: Context<CreateSST>) -> Result<()> {
        ctx.accounts.create_sst()?;
        Ok(())
    }

    pub fn create_pool(
        ctx: Context<CreatePool>
    ) -> Result<()> {
        ctx.accounts.create_pool()?;
        Ok(())
    }
    
    pub fn create_endcoin(ctx: Context<CreateEndcoin>) -> Result<()>
    {
        ctx.accounts.initialize_endcoin()?;
        Ok(())
    }
    pub fn create_gaiacoin(ctx: Context<CreateGaiacoin>) -> Result<()>
    {
        ctx.accounts.initialize_gaiacoin()?;
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
        // min_output_amount: u64,
    ) -> Result<()> {
        ctx.accounts.swap_exact_tokens_for_tokens(swap_a, input_amount, &ctx.bumps)
    }

    pub fn pull_feed(ctx: Context<PullFeed>) -> Result<()> {
        ctx.accounts.pull_feed()?;
        Ok(())
    }

    pub fn update_timestamp(ctx: Context<HelloState>) -> Result<()> {
        ctx.accounts.update_timestamp()?;
        Ok(())
    }

    // pub fn create_mint_account(
    //     ctx: Context<CreateMintAccount>,
    //     args: CreateMintAccountArgs,
    // ) -> Result<()> {
    //     instructions::handler(ctx, args)
    // }

    // pub fn check_mint_extensions_constraints(
    //     _ctx: Context<CheckMintExtensionConstraints>,
    // ) -> Result<()> {
    //     Ok(())
    // }







}
