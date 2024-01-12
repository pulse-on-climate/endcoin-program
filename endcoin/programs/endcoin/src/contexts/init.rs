use anchor_lang::prelude::*;
use anchor_spl::{token_interface::{Mint, TokenInterface}, associated_token::AssociatedToken, metadata::mpl_token_metadata::{types::DataV2, accounts::Metadata}};
use anchor_spl::metadata::{CreateMetadataAccountsV3, create_metadata_accounts_v3};
// initialize endcoin 
// add metaplex metadata 
#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Init<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
        init,
        payer = signer,
        seeds = [b"endcoin"],
        bump,
        mint::decimals = 6,
        mint::authority = auth,
    )] pub endcoin_mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = signer,
        seeds = [b"gaiacoin"],
        bump,
        mint::decimals = 6,
        mint::authority = auth,
    )] pub gaiacoin_mint: InterfaceAccount<'info, Mint>,
    /// CHECK: This account is only used for signing purposes
    #[account(
        seeds = [b"auth"], bump
    )] pub auth: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>, 
    pub rent: Sysvar<'info, Rent>,
    pub metadata_program: Program<'info, Metadata>,
}

impl<'info> Init<'info> {
    
    pub fn create_metadata(&mut self, name: String, symbol: String, uri: String) -> Result<()> {
        let accounts = CreateMetadataAccountsV3{
            metadata: self.metadata_program.to_account_info(),   
            mint: self.endcoin_mint.to_account_info(),
            mint_authority: self.auth.to_account_info(),
            payer: self.signer.to_account_info(),
            update_authority: self.auth.to_account_info(),
            system_program: self.system_program.to_account_info(),
            rent: self.rent.to_account_info(), // what do I do with rent now? 
    
        };
        
        let seeds = [&[b"auth",  &[bump]]];
        let signer_seeds = &[&seeds[..]];
    
        let cpi_ctx = CpiContext::new_with_signer(metadata_program, accounts, signer_seeds);
    
        let data = DataV2{
            name,
            symbol,
            uri,
            seller_fee_basis_points:0,
            creators:None,
            collection:None,
            uses:None
        };
    
        create_metadata_accounts_v3(cpi_ctx, data, false, true, None)
    }





    pub fn init(&mut self
    ) -> Result<()> {
        
        Ok(())
    }
}



