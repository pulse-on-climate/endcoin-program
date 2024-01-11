use anchor_lang::prelude::*;
use crate::state::Config;
use anchor_spl::{token_interface::{TokenAccount, Mint, TokenInterface}, associated_token::AssociatedToken};

// In emit, we intend to emit endcoin and gaiacoin tokens to the vault accounts owned by the AMM.

#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Emit<'info> {
    #[account(mut)] // do we want this to be mutable? This is the account that is signing the transaction which should only be allowed by one account. 
    pub initializer: Signer<'info>,
    pub endcoin_mint: InterfaceAccount<'info, Mint>,
    pub gaiacoin_mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = initializer,
        associated_token::mint = endcoin_mint,
        associated_token::authority = auth,
    )] pub endcoin_vault:     InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = initializer,
        associated_token::mint = gaiacoin_mint,
        associated_token::authority = auth,
    )] pub gaiacoin_vault: InterfaceAccount<'info, TokenAccount>,
    
    /// CHECK: This account is only used for signing purposes
    #[account(
        seeds = [b"auth"], bump
    )] pub auth: UncheckedAccount<'info>,
    
    #[account(
        init,
        payer = initializer,
        seeds = [b"config", seed.to_le_bytes().as_ref()],
        bump,
        space = Config::INIT_SPACE,
    )] pub config: Account<'info, Config>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>, 
}

impl<'info> Emit<'info> {
    pub fn mint(&mut self,
        seed: u64,
        fee: u16,
        authority: Option<Pubkey>,
        temperature: u8,
    ) -> Result<()> {
        

    Ok(())
    }
    
    pub fn send(&mut self, amount_endcoin: u64, amount_gaiacoin: u64) -> Result<()> {
        // Code to send endcoin and gaiacoin to the AMM, and to a list of pre-defined accounts that deserve endcoin. 
        Ok(())
    }
}