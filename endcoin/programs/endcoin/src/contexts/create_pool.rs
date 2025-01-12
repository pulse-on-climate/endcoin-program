use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        Mint,
        Token2022, TokenAccount
    },
};
use crate::{
    constants::{POOL_AUTHORITY_SEED, AMM_SEED},
    errors::*,
    state::{Amm, Pool},
};

impl<'info> CreatePool<'info> {
    pub fn create_pool(&mut self) -> Result<()> {
        let pool = &mut self.pool;
        pool.amm = self.amm.key();
        pool.mint_a = self.mint_a.key();
        pool.mint_b = self.mint_b.key();

        Ok(())

    

    }
}

impl<'info> CreateTokenAccounts<'info> {
    pub fn create_token_accounts(&mut self) -> Result<()> {
        Ok(())
    }
}



#[derive(Accounts)]
pub struct CreatePool<'info> {
    #[account(
        seeds = [
            AMM_SEED,
            amm.id.as_ref()
        ],
        bump,
    )]
    pub amm: Box<Account<'info, Amm>>,

    #[account(
        init,
        payer = payer,
        space = Pool::LEN,
        seeds = [
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
        ],
        bump,
        // todo: confirm all constraints for pool account.
        constraint = mint_a.key() != mint_b.key() @ AmmError::InvalidMint,
    )]
    pub pool: Box<Account<'info, Pool>>,
    /// CHECK:
    #[account(
        seeds = [
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
            POOL_AUTHORITY_SEED,
        ],
        bump,
    )]
    pub pool_authority: AccountInfo<'info>,

    #[account(
        init,
        signer,
        payer = payer,
        mint::token_program = token_program,
        mint::decimals = 6,
        mint::authority = pool_authority,
        mint::freeze_authority = pool_authority,
        extensions::metadata_pointer::authority = pool_authority,
        extensions::metadata_pointer::metadata_address = mint_liquidity,
        extensions::group_member_pointer::authority = pool_authority,
        extensions::group_member_pointer::member_address = mint_liquidity,
        extensions::transfer_hook::authority = pool_authority,
        extensions::transfer_hook::program_id = crate::ID,
        extensions::close_authority::authority = pool_authority,
        extensions::permanent_delegate::delegate = pool_authority,
    )]
    pub mint_liquidity: Box<InterfaceAccount<'info, Mint>>,

    pub mint_a: Box<InterfaceAccount<'info, Mint>>,

    pub mint_b: Box<InterfaceAccount<'info, Mint>>,

    /// The account paying for all rents
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Solana ecosystem accounts
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token2022>,
}

#[derive(Accounts)]
pub struct CreateTokenAccounts<'info> {
    #[account(
        init,
        payer = payer,
        associated_token::mint = mint_a,
        associated_token::authority = pool_authority,
    )]
    pub pool_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint_b,
        associated_token::authority = pool_authority,
    )]
    pub pool_account_b: Box<InterfaceAccount<'info, TokenAccount>>,
    /// CHECK:
    #[account(
        seeds = [
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
            POOL_AUTHORITY_SEED,
        ],
        bump,
    )]
    pub pool_authority: AccountInfo<'info>,

    #[account(
        seeds = [
            AMM_SEED,
            amm.id.as_ref()
        ],
        bump,
    )]
    pub amm: Box<Account<'info, Amm>>,


    pub mint_a: Box<InterfaceAccount<'info, Mint>>,

    pub mint_b: Box<InterfaceAccount<'info, Mint>>,

    /// The account paying for all rents
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token2022>,

}