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
    pub fn initial_pool_mint(
        ctx: Context<InitialPoolMint>
    ) -> Result<()> {
        ctx.accounts.initial_pool_mint(ctx.bumps)?;
        Ok(())
    }
    
    pub fn create_mints(ctx: Context<CreateMints>, token: bool) -> Result<()>
    {
        handler(ctx, token)?;
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


    // pub fn read_feed(ctx: Context<Switchboard>, params: ReadFeedParams) -> Result<()> {
    //     ctx.accounts.read_feed(params)?;
    //     Ok(())
    // }


    // pub fn create_mint_account(
    //     ctx: Context<CreateMintAccount>,
    //     args: CreateMintAccountArgs,
    // ) -> Result<()> {
    //     instructions::handler(ctx, args)
    // }

    pub fn check_mint_extensions_constraints(
        _ctx: Context<CheckMintExtensionConstraints>,
    ) -> Result<()> {
        Ok(())
    }







}
