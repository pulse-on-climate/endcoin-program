use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, Mint, MintTo, Token, TokenAccount},
};

use crate::{
    constants::{AUTHORITY_SEED, LIQUIDITY_SEED}, state::{State, Amm, Pool}, AmmError
};

#[derive(Accounts)]
pub struct CreatePool<'info> {
    #[account(
        seeds = [
        b"amm".as_ref(),
        ],
        bump,
    )]
    pub amm: Account<'info, Amm>,

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
        // constraint = mint_a.key() < mint_b.key() @ AmmError::InvalidMint
    )]
    pub pool: Account<'info, Pool>,

    /// CHECK: Read only authority
    #[account(
        seeds = [
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
            AUTHORITY_SEED.as_ref(),
        ],
        bump,
    )]
    pub pool_authority: AccountInfo<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 3,
        mint::authority = pool_authority,
    )]
    pub mint_liquidity: Box<Account<'info, Mint>>,
    #[account(
       mut,
       // address = state.mint_a, //set this to state endcoin address 
    )]
    pub mint_a: Box<Account<'info, Mint>>,
    #[account(
        mut,
        //address = state.mint_b, //set this to state gaiacoin address 
    )]
    pub mint_b: Box<Account<'info, Mint>>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint_a,
        associated_token::authority = pool_authority,
    )]
    pub pool_account_a: Box<Account<'info, TokenAccount>>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint_b,
        associated_token::authority = pool_authority,
    )]
    pub pool_account_b: Box<Account<'info, TokenAccount>>,


    /// CHECK: Mint authority account
    #[account(
        seeds = [b"auth"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,

    /// The account paying for all rents
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Solana ecosystem accounts
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    #[account(
        seeds = [
        b"state".as_ref(),
        amm.key().as_ref(),
        ],
        bump,
    )]
    pub state: Account<'info, State>,
}



// IMPL 


impl<'info> CreatePool<'info> {
    pub fn create_pool(
        &mut self,
        bumps: CreatePoolBumps
    ) -> Result<()> {

        let initial_amount: u64 = 6920508831;
        
        let seeds = &[
            "auth".as_bytes(),
            &[bumps.mint_authority]
        ];

        let signer_seeds = &[&seeds[..]];


        let _ = mint_to(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(), 
                MintTo
                {
                    mint: self.mint_a.to_account_info(),
                    to: self.pool_account_a.to_account_info(),
                    authority: self.mint_authority.to_account_info(),
                } ,
                signer_seeds
            ),
            initial_amount
        );

        let _ = mint_to(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(), 
                MintTo
                {
                    mint: self.mint_b.to_account_info(),
                    to: self.pool_account_b.to_account_info(),
                    authority: self.mint_authority.to_account_info(),
                } ,
                signer_seeds
            ),
            initial_amount
        );
        


        let pool = &mut self.pool;
        pool.amm = self.amm.key();
        pool.mint_a = self.mint_a.key();
        pool.mint_b = self.mint_b.key();

        Ok(())

        // mint and deposit liquidity to the depositor/initializor ATA then sent to the pool. 


    }
}