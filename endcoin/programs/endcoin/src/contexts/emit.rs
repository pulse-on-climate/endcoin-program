use anchor_lang::{prelude::*, solana_program::pubkey};
use crate::state::Config;
use anchor_spl::{token_interface::{TokenAccount, Mint, TokenInterface, mint_to, MintTo}, associated_token::AssociatedToken};
#[derive(Accounts)]
pub struct MintTokens<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        mut,
        seeds = [b"endcoin"],
        bump,
        mint::decimals = 6,
        mint::authority = auth,
    )]
    pub endcoin_mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        seeds = [b"gaiacoin"],
        bump,
        mint::decimals = 6,
        mint::authority = auth,
    )]
    pub gaiacoin_mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = signer,
        associated_token::mint = endcoin_mint,
        associated_token::authority = auth,
    )] pub endcoin_vault: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = signer,
        associated_token::mint = gaiacoin_mint,
        associated_token::authority = auth,
    )] pub gaiacoin_vault: InterfaceAccount<'info, TokenAccount>,
    /// CHECK: This account is only used for signing purposes
    #[account(
        seeds = [b"auth"], bump
    )] pub auth: UncheckedAccount<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
}


impl<'info> MintTokens<'info> {
    pub fn mint_tokens(
        &self, 
        quantity: u64, 
        to: InterfaceAccount<'info, TokenAccount >, 
        mint: InterfaceAccount<'info, Mint>,
        mint_seeds_string: &str, 
    ) -> Result<()> {
        let seeds = &[mint_seeds_string.as_bytes()];
        let signer = [&seeds[..]];

        mint_to(
            CpiContext::new_with_signer(
                self.token_program.to_account_info(),
                MintTo {
                    authority: self.auth.to_account_info(),
                    to: to.to_account_info(), 
                    mint: self.endcoin_mint.to_account_info(),
                },
                &signer,
            ),
            quantity,
        )?;

        Ok(())
    }
    pub fn mint(&mut self,

    ) -> Result<()> {
        

    Ok(())
    }
    
    pub fn send(&mut self, amount_endcoin: u64, amount_gaiacoin: u64) -> Result<()> {
        // Code to send endcoin and gaiacoin to the AMM, and to a list of pre-defined accounts that deserve endcoin. 
        Ok(())
    }
}