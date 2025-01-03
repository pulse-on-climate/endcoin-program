use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        Mint,
        Token2022,
    },
};


use crate::constants::POOL_AUTHORITY_SEED;
use crate::state::{Amm, Pool};
use crate::AmmError;


#[derive(Accounts)]
pub struct CreatePool<'info> {

    #[account(
    seeds = [    
        amm.id.as_ref()
    ],
    bump,
    )]
    pub amm: Box<Account<'info, Amm>>,
    // the pool account
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
        constraint = mint_a.key() < mint_b.key() @ AmmError::InvalidMint
    )]
    pub pool: Box<Account<'info, Pool>>,

    // the pool authority
    /// CHECK: Read only authority
    #[account(
        seeds = [
            pool.amm.key().as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
            POOL_AUTHORITY_SEED.as_ref(),
        ],
        bump,
    )]
pub pool_authority: AccountInfo<'info>,


    // mint_a Mint
    #[account(mut)]
    pub mint_a: Box<InterfaceAccount<'info, Mint>>,

    // mint_b Mint
    #[account(mut)]
    pub mint_b: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,

}

// IMPL 
impl<'info> CreatePool<'info> {
    pub fn create_pool(
        &mut self,
    ) -> Result<()> {

        let pool = &mut self.pool;
        pool.amm = self.amm.key();
        pool.mint_a = self.mint_a.key();
        pool.mint_b = self.mint_b.key();

        Ok(())

        // mint and deposit liquidity to the depositor/initializor ATA then sent to the pool. 

    }
}

