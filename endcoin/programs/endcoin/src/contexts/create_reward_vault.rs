use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        Mint,
        Token2022, TokenAccount
    },
};
use crate::{
    constants::REWARD_VAULT_SEED, errors::AmmError, state::{Pool, RewardVault}
};

impl<'info> CreateRewardVault<'info> {
    pub fn create_reward_vault(&mut self, bumps: &CreateRewardVaultBumps) -> Result<()> {
        let reward_vault = &mut self.reward_vault;
        reward_vault.pool = self.pool.key();
        reward_vault.mint_a = self.mint_a.key();
        reward_vault.mint_b = self.mint_b.key();
        reward_vault.bump = bumps.reward_vault;

        Ok(())

    }
}

impl<'info> CreateRewardTokenAccounts<'info> {
    pub fn create_reward_token_accounts(&mut self) -> Result<()> {

        Ok(())
    }
}

#[derive(Accounts)]
pub struct CreateRewardVault<'info> {

    #[account(
        init,
        payer = payer,
        space = RewardVault::LEN,
        seeds = [
            pool.key().as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
            REWARD_VAULT_SEED,
        ],
        bump,
        // todo: confirm all constraints for pool account.
        // constraint = mint_a.key() != mint_b.key() @ AmmError::InvalidMint,
    )]
    pub reward_vault: Box<Account<'info, RewardVault>>,

    #[account(
        seeds = [
            pool.amm.as_ref(),
            pool.mint_a.key().as_ref(),
            pool.mint_b.key().as_ref(),
        ],
        bump,
    )]
    pub pool: Box<Account<'info, Pool>>,

    #[account(mut)]
    pub mint_a: Box<InterfaceAccount<'info, Mint>>,
    #[account(mut)]
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
pub struct CreateRewardTokenAccounts<'info> {
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
    pub pool: Box<Account<'info, Pool>>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint_a,
        associated_token::authority = reward_vault,
    )]
    pub reward_account_a: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init,
        payer = payer,
        associated_token::mint = mint_b,
        associated_token::authority = reward_vault,
    )]
    pub reward_account_b: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        seeds = [
            pool.key().as_ref(),
            mint_a.key().as_ref(),
            mint_b.key().as_ref(),
            REWARD_VAULT_SEED,
        ],
        bump = reward_vault.bump,
    )]
    pub reward_vault: Account<'info, RewardVault>,

    pub mint_a: Box<InterfaceAccount<'info, Mint>>,

    pub mint_b: Box<InterfaceAccount<'info, Mint>>,

    /// The account paying for all rents
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token2022>,

}