use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, token_2022::TransferChecked, token_interface::{
        Mint,
        Token2022,
        TokenAccount
    }
};
use fixed::types::I64F64;

use crate::{
    constants::{AMM_SEED, AUTHORITY_SEED, POOL_AUTHORITY_SEED},
    errors::*,
    state::Amm,
};

#[derive(Accounts)]
pub struct SwapExactTokensForTokens<'info> {
    #[account(
        seeds = [
            AMM_SEED,
            amm.id.as_ref(),
        ],
        bump,
    )]
    pub amm: Account<'info, Amm>,

    /// CHECK: Read only authority
    #[account(
        mut,
        seeds = [
            amm.key().as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
            POOL_AUTHORITY_SEED,
        ],
        bump,
    )]
    pub pool_authority: AccountInfo<'info>,

    /// The account doing the swap
    pub trader: Signer<'info>,

    pub mint_a: Box<InterfaceAccount<'info, Mint>>,
    pub mint_b: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        constraint = pool_account_a.owner == pool_authority.key(),
        constraint = pool_account_a.mint == mint_a.key(),
    )] pub pool_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = pool_account_b.owner == pool_authority.key(),
        constraint = pool_account_b.mint == mint_b.key(),
    )] pub pool_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_a,
        associated_token::authority = trader,
    )] pub trader_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint_b,
        associated_token::authority = trader,
    )] pub trader_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    /// The account paying for rent
    #[account(mut)] pub payer: Signer<'info>,

    // Solana accounts
    pub token_program: Program<'info, Token2022>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl<'info> SwapExactTokensForTokens<'info> {
pub fn swap_exact_tokens_for_tokens(
    &mut self,
    swap_a: bool,
    input_amount: u64,
    // min_output_amount: u64,
    bumps: &SwapExactTokensForTokensBumps
) -> Result<()> {
    // Prevent depositing assets the depositor does not own
    let input = if swap_a && input_amount > self.trader_account_a.amount {
        self.trader_account_a.amount
    } else if !swap_a && input_amount > self.trader_account_b.amount {
        self.trader_account_b.amount
    } else {
        input_amount
    };

    let amm = &self.amm;
    let pool_a = &self.pool_account_a;
    let pool_b = &self.pool_account_b;

    msg!("Input amount: {}", input);
    msg!("Pool A amount: {}", pool_a.amount);
    msg!("Pool B amount: {}", pool_b.amount);
    msg!("Fee: {}", amm.fee);

    // Calculate fee
    let fee_amount = (input as u128 * amm.fee as u128 / 10000) as u64;
    let taxed_input = input.checked_sub(fee_amount)
        .ok_or(AmmError::Overflow)?;

    msg!("Fee amount: {}", fee_amount);
    msg!("Taxed input: {}", taxed_input);

    // Calculate output based on current ratio
    let output = if swap_a {
        msg!("Swapping A for B");
        // If swapping A for B, use B/A ratio
        let ratio = (pool_b.amount as u128)
            .checked_div(pool_a.amount as u128)
            .ok_or(AmmError::Overflow)?;
        msg!("Base ratio: {}", ratio);

        let scaled_input = (taxed_input as u128)
            .checked_mul(10_u128.pow(6))
            .ok_or(AmmError::Overflow)?;
        msg!("Scaled input: {}", scaled_input);

        let result = scaled_input.checked_mul(ratio)
            .ok_or(AmmError::Overflow)?;
        msg!("Result before descaling: {}", result);

        (result.checked_div(10_u128.pow(6))
            .ok_or(AmmError::Overflow)?) as u64
    } else {
        msg!("Swapping B for A");
        // If swapping B for A, use A/B ratio
        let ratio = (pool_a.amount as u128)
            .checked_div(pool_b.amount as u128)
            .ok_or(AmmError::Overflow)?;
        msg!("Base ratio: {}", ratio);

        let scaled_input = (taxed_input as u128)
            .checked_mul(10_u128.pow(6))
            .ok_or(AmmError::Overflow)?;
        msg!("Scaled input: {}", scaled_input);

        let result = scaled_input.checked_mul(ratio)
            .ok_or(AmmError::Overflow)?;
        msg!("Result before descaling: {}", result);

        (result.checked_div(10_u128.pow(6))
            .ok_or(AmmError::Overflow)?) as u64
    };

    msg!("Output amount: {}", output);

    // if output < min_output_amount {
    //     return err!(AmmError::OutputTooSmall);
    // }

    // Compute the invariant before the trade
    let invariant = pool_a.amount * pool_b.amount;

    // Transfer tokens to the pool
    let authority_bump = bumps.pool_authority;
    let authority_seeds = &[
        // &self.pool.amm.to_bytes(),
        &self.mint_a.key().to_bytes(),
        &self.mint_b.key().to_bytes(),
        AUTHORITY_SEED,
        &[authority_bump],
    ];
    let signer_seeds = &[&authority_seeds[..]];
    if swap_a {
        anchor_spl::token_interface::transfer_checked(
            CpiContext::new(
                self.token_program.to_account_info(),
                TransferChecked {
                    from: self.trader_account_a.to_account_info(),
                    mint: self.mint_a.to_account_info(),
                    to: self.pool_account_a.to_account_info(),
                    authority: self.trader.to_account_info(),
                },
            ),
            input,
            6,
        )?;
        anchor_spl::token_interface::transfer_checked(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                TransferChecked {
                    from: self.pool_account_b.to_account_info(),
                    mint: self.mint_b.to_account_info(),
                    to: self.trader_account_b.to_account_info(),
                    authority: self.pool_authority.to_account_info(),
                },
                signer_seeds,
            ),
            output,
            6,
        )?;
    } else {
        anchor_spl::token_interface::transfer_checked(
            CpiContext::new(
                self.token_program.to_account_info(),
                TransferChecked {
                    from: self.trader_account_b.to_account_info(),
                    mint: self.mint_b.to_account_info(),
                    to: self.pool_account_b.to_account_info(),
                    authority: self.trader.to_account_info(),
                },
            ),
            input,
            6,
        )?;

        anchor_spl::token_interface::transfer_checked(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                TransferChecked {
                    from: self.pool_account_a.to_account_info(),
                    mint: self.mint_a.to_account_info(),
                    to: self.trader_account_a.to_account_info(),
                    authority: self.pool_authority.to_account_info(),
                },
                signer_seeds,
            ),
            output,
            6,
        )?;
    }

    msg!(
        "Traded {} tokens ({} after fees) for {}",
        input,
        taxed_input,
        output
    );

    // Verify the invariant still holds
    // Reload accounts because of the CPIs
    // We tolerate if the new invariant is higher because it means a rounding error for LPs
    self.pool_account_a.reload()?;
    self.pool_account_b.reload()?;
    if invariant > self.pool_account_a.amount * self.pool_account_b.amount {
        return err!(AmmError::InvariantViolated);
    }

    Ok(())
}
}
