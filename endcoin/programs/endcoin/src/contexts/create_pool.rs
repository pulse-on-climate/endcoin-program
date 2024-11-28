use anchor_lang::prelude::*;

use anchor_spl::{
    associated_token::AssociatedToken,
    token::{mint_to, MintTo},
    token_interface::{
        Mint,
        Token2022, TokenAccount
    },
};


use crate::constants::POOL_AUTHORITY_SEED;
use crate::state::{Amm,Pool};
use crate::AmmError;


#[derive(Accounts)]
pub struct CreatePool<'info> {

    #[account(
    seeds = [    
        amm.id.as_ref()
    ],
    bump
    )]
    pub amm: Box<Account<'info, Amm>>,
    // the pool account
    #[account(
        init,
        payer = payer,
        space = Pool::LEN,
        seeds = [
            amm.key().as_ref(),
            endcoin.key().as_ref(),
            gaiacoin.key().as_ref(),
        ],
        bump,
        constraint = endcoin.key() < gaiacoin.key() @ AmmError::InvalidMint
    )]
    pub pool: Box<Account<'info, Pool>>,

    // the pool authority
    /// CHECK: Read only authority
    #[account(
        seeds = [
            POOL_AUTHORITY_SEED.as_ref(),
        ],
        bump,
    )]
    pub pool_authority: AccountInfo<'info>,
    
    // Endcoin Mint
    #[account(mut)]
    pub endcoin: Box<InterfaceAccount<'info, Mint>>,

    // Gaiacoin Mint
    #[account(mut)]
    pub gaiacoin: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut)]
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,

}

#[derive(Accounts)]
#[account(zero_copy)]
pub struct InitialPoolMint<'info> {

    // the pool account
    #[account(
        seeds = [
            endcoin.key().as_ref(),
            gaiacoin.key().as_ref(),
        ],
        bump
    )]
    pub pool: Box<Account<'info, Pool>>,

    // the pool authority
    /// CHECK: Read only authority
    #[account(
        seeds = [
            POOL_AUTHORITY_SEED.as_ref(),
        ],
        bump,
    )]
    pub pool_authority: AccountInfo<'info>,

    // pulse token mint
    #[account(
        init,
        signer,
        payer = payer,
        mint::token_program = token_program,
        mint::decimals = 6,
        mint::authority = pool_authority,
        // mint::freeze_authority = pool_authority,
        // extensions::metadata_pointer::authority = pool_authority,
        // extensions::metadata_pointer::metadata_address = gaiacoin,
        // extensions::group_member_pointer::authority = pool_authority,
        // extensions::group_member_pointer::member_address = gaiacoin,
        // extensions::transfer_hook::authority = pool_authority,
        // extensions::transfer_hook::program_id = crate::ID,
        // extensions::close_authority::authority = pool_authority,
        // extensions::permanent_delegate::delegate = pool_authority,
    )]
    pub mint_liquidity_pool: Box<InterfaceAccount<'info, Mint>>,
    
    // Endcoin Mint
    #[account(mut)]
    pub endcoin: Box<InterfaceAccount<'info, Mint>>,

    // Gaiacoin Mint
    #[account(mut)]
    pub gaiacoin: Box<InterfaceAccount<'info, Mint>>,

    // pool endcoin mint ATA
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = endcoin,
        associated_token::token_program = token_program,
        associated_token::authority = pool,
    )]
    pub pool_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    // pool gaiacoin mint ATA
    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = gaiacoin,
        associated_token::token_program = token_program,
        associated_token::authority = pool,
    )]
    pub pool_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

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
        pool.mint_a = self.endcoin.key();
        pool.mint_b = self.gaiacoin.key();

        Ok(())

        // mint and deposit liquidity to the depositor/initializor ATA then sent to the pool. 

    }
}


// IMPL 
impl<'info> InitialPoolMint<'info> {
    pub fn initial_pool_mint(
        &mut self,
        bumps: InitialPoolMintBumps
    ) -> Result<()> {

        let initial_amount: u64 = 6920508;
        
        let seeds = &[
            POOL_AUTHORITY_SEED,
            &[bumps.pool_authority]
        ];

        let signer_seeds = &[&seeds[..]];


        let _ = mint_to(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(), 
                MintTo
                {
                    mint: self.endcoin.to_account_info(),
                    to: self.pool_account_a.to_account_info(),
                    authority: self.pool_authority.to_account_info(),
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
                    mint: self.gaiacoin.to_account_info(),
                    to: self.pool_account_b.to_account_info(),
                    authority: self.pool_authority.to_account_info(),
                } ,
                signer_seeds
            ),
            initial_amount
        );
        
        Ok(())

    }
}