use anchor_lang::prelude::*;
use anchor_spl::{
    metadata::{
        mpl_token_metadata::instructions::CreateV1CpiBuilder,
        mpl_token_metadata::types::TokenStandard, 
        Metadata,
        
    },
    token::{
        Mint, 
        Token
    },
};

use anchor_lang::solana_program::sysvar::id as INSTRUCTION_ID;
use crate::errors::MetadataError;

#[derive(Accounts)]
pub struct CreateMetadata<'info> {
    #[account(
        init,
        payer = payer,
        mint::decimals = 2,
        mint::authority = authority,
    )]
    pub mint: Account<'info, Mint>,

    /// CHECK: Using account for metadata
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    /// CHECK: Read only authority
    #[account(
        seeds = [b"auth"],
        bump
    )]
    pub authority: UncheckedAccount<'info>,

    // The account paying for all rents
    #[account(mut)]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,

    /// CHECK: no need to check it out
    #[account(address = INSTRUCTION_ID())]
    pub sysvar_instruction: AccountInfo<'info>,

    pub token_metadata_program: Program<'info, Metadata>,
}

impl<'info> CreateMetadata<'info> {
    pub fn create_metadata(
        &mut self, 
        token: u8,
        bumps: CreateMetadataBumps
    ) -> Result<()> {
        let seeds = &[
            "auth".as_bytes(),
            &[bumps.authority]
        ];

        let signer_seeds = &[&seeds[..]];

        let name: &str;
        let symbol: &str;
        let uri: &str;
        match token {
            0 => {
                name = "Endcoin";
                symbol = "END";
                uri = "https://endcoin.com";
            }
            1 => {
                name = "Gaiacoin";
                symbol = "GAIA";
                uri = "https://endcoin.com/gaia";
            }
            _=> return Err(MetadataError::InvalidMetadata.into()), // write custom error 
        };

            CreateV1CpiBuilder::new(&self.token_metadata_program)
            .metadata(&self.metadata.to_account_info())
            .mint(&self.mint.to_account_info(), false)
            .authority(&self.authority.to_account_info())
            .payer(&self.payer.to_account_info())
            .update_authority(&self.authority.to_account_info(), false)
            .system_program(&self.system_program.to_account_info())
            .sysvar_instructions(&self.sysvar_instruction.to_account_info())
            .spl_token_program(&self.token_program.to_account_info())
            .name(name.to_string())
            .symbol(symbol.to_string())
            .uri(uri.to_string())
            .seller_fee_basis_points(200)
            .token_standard(TokenStandard::Fungible)
            .invoke_signed(signer_seeds)?;

            Ok(())
        }
}