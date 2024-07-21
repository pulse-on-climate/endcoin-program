use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{self, mint_to, Mint, MintTo, Token, TokenAccount},
};
use fixed::types::I64F64;
use fixed_sqrt::FixedSqrt;

use crate::{
     state::Pool, 
     state::SST
};

impl<'info> DepositLiquidity<'info> { 
pub fn deposit_liquidity(
    &mut self,
    bumps: &DepositLiquidityBumps,
    mean_temp: f64,
) -> Result<()> {

    // Calculate the amount of liquidity to mint for endcoin and gaiacoin
    const DEATH: f64 = 35.000;
    const ENDRATE: f64 = 1.125;
    const GAIARATE: f64 = 0.750;
    let mean_temp: f64 = mean_temp;
    //Endcoin calculation
    let endcoin_emission = (ENDRATE * (DEATH - mean_temp)) - 1.000;
    let endcoin_exp = (endcoin_emission).exp() as u64;
    //Gaiacoin calculation
    let gaiacoin_emission= (GAIARATE * (mean_temp)) - 1.000;
    let gaiacoin_exp = (gaiacoin_emission).exp() as u64;

    let amount_a: u64 = (endcoin_exp / 100) * 95;
    let amount_b: u64 = (gaiacoin_exp / 100) * 95;

    let user_amount_a: u64 = (endcoin_exp / 100) * 5;
    let user_amount_b: u64 = (gaiacoin_exp / 100) * 5;
  


    // Computing the amount of liquidity about to be deposited
    let liquidity = I64F64::from_num(amount_a)
        .checked_mul(I64F64::from_num(amount_b))
        .unwrap()
        .sqrt()
        .to_num::<u64>();

    // Mint tokens directly to pool, as we don't need a depositor. 
    let seeds = &[
        "auth".as_bytes(),
        &[bumps.mint_authority]
    ];
    let mint_signer_seeds = &[&seeds[..]];

    // minting the correct amount of tokens to the pool for token a
    let _ = mint_to(
        CpiContext::new_with_signer(
            self.token_program.to_account_info(), 
            MintTo
            {
                mint: self.mint_a.to_account_info(),
                to: self.pool_account_a.to_account_info(),
                authority: self.mint_authority.to_account_info(),
            } ,
            mint_signer_seeds
        ),
        amount_a
    );

// minting the correct amount of tokens to the pool for token b
    let _ = mint_to(
        CpiContext::new_with_signer(
            self.token_program.to_account_info(), 
            MintTo
            {
                mint: self.mint_b.to_account_info(),
                to: self.pool_account_b.to_account_info(),
                authority: self.mint_authority.to_account_info(),
            } ,
            mint_signer_seeds
        ),
        amount_b
    );

    // minting the correct amount of tokens to the user for token a
    let _ = mint_to(
        CpiContext::new_with_signer(
            self.token_program.to_account_info(), 
            MintTo
            {
                mint: self.mint_a.to_account_info(),
                to: self.user_account_a.to_account_info(),
                authority: self.mint_authority.to_account_info(),
            } ,
            mint_signer_seeds
        ),
        user_amount_a
    );


// minting the correct amount of tokens to the user for token b
let _ = mint_to(
    CpiContext::new_with_signer(
        self.token_program.to_account_info(), 
        MintTo
        {
            mint: self.mint_b.to_account_info(),
            to: self.user_account_b.to_account_info(),
            authority: self.mint_authority.to_account_info(),
        } ,
        mint_signer_seeds
    ),
    user_amount_b
);


    // Transfer tokens to the pool
    // token::transfer(
    //     CpiContext::new(
    //         self.token_program.to_account_info(),
    //         Transfer {
    //             from: self.depositor_account_a.to_account_info(),
    //             to: self.pool_account_a.to_account_info(),
    //             authority: self.depositor.to_account_info(),
    //         },
    //     ),
    //     amount_a,
    // )?;
    // token::transfer(
    //     CpiContext::new(
    //         self.token_program.to_account_info(),
    //         Transfer {
    //             from: self.depositor_account_b.to_account_info(),
    //             to: self.pool_account_b.to_account_info(),
    //             authority: self.depositor.to_account_info(),
    //         },
    //     ),
    //     amount_b,
    // )?;

    // Mint the liquidity to locked AMM.
    let authority_bump = bumps.pool_authority;
    let authority_seeds = &[
        &self.mint_a.key().to_bytes(),
        &self.mint_b.key().to_bytes(),
        b"authority".as_ref(),
        &[authority_bump],
    ];
    let liquidity_signer_seeds = &[&authority_seeds[..]];
    token::mint_to(
        CpiContext::new_with_signer(
            self.token_program.to_account_info(),
            MintTo {
                mint: self.mint_liquidity.to_account_info(),
                to: self.depositor_account_liquidity.to_account_info(),
                authority: self.pool_authority.to_account_info(),
            },
            liquidity_signer_seeds
        ),
        liquidity,
    )?;

    Ok(())
}
}
#[derive(Accounts)]
pub struct DepositLiquidity<'info> {
    #[account(
        seeds = [
            pool.amm.as_ref(),
            pool.mint_a.key().as_ref(),
            pool.mint_b.key().as_ref(),
        ],
        bump,
        has_one = mint_a,
        has_one = mint_b,
    )]
    pub pool: Account<'info, Pool>,

    /// CHECK: Read only authority
    #[account(
        mut,
        seeds = [
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
            b"authority".as_ref(),
        ],
        bump,
    )]
    pub pool_authority: AccountInfo<'info>,
    /// The account paying for all rents
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(mut)]
    pub user_payer: Signer<'info>,

    #[account(mut)]
    pub mint_liquidity: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub mint_a: Box<Account<'info, Mint>>,

    #[account(mut)]
    pub mint_b: Box<Account<'info, Mint>>,

    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = pool_authority,
    )]
    pub pool_account_a: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = mint_b,
        associated_token::authority = pool_authority,
    )]
    pub pool_account_b: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_a,
        associated_token::authority = pool_authority,
    )]
    pub user_account_a: Box<Account<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_b,
        associated_token::authority = pool_authority,
    )]
    pub user_account_b: Box<Account<'info, TokenAccount>>,
    #[account(
        
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_liquidity,
        associated_token::authority = mint_authority,
    )]
    pub depositor_account_liquidity: Box<Account<'info, TokenAccount>>,

    // #[account(
    //     init_if_needed,
    //     payer = payer,
    //     associated_token::mint = mint_a,
    //     associated_token::authority = depositor,
    // )]
    // pub depositor_account_a: Box<Account<'info, TokenAccount>>,

    // #[account(
    //     init_if_needed,
    //     payer = payer,
    //     associated_token::mint = mint_b,
    //     associated_token::authority = depositor,
    // )]
    // pub depositor_account_b: Box<Account<'info, TokenAccount>>,

    /// Solana ecosystem accounts
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,

    #[account(mut,
        seeds = [
            b"seaSurfaceTemperature",
        ],
        bump
    )] pub sst: Account<'info, SST>,
    /// CHECK: Mint authority account
    #[account(
        mut,
        seeds = [b"auth"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
}
