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
use crate::state::{State, Amm};
use anchor_lang::solana_program::sysvar::instructions::id as INSTRUCTION_ID;
use crate::errors::MetadataError;

#[derive(Accounts)]
pub struct CreateMetadata<'info> {
    #[account(
        init,
        payer = payer,
        mint::decimals = 3,
        mint::authority = mint_authority,
    )]
    pub mint: Account<'info, Mint>,
    /// CHECK: Read only authority
    #[account(
        seeds = [b"auth"],
        bump
    )]
    pub mint_authority: UncheckedAccount<'info>,
    /// CHECK: Using account for metadata
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    // The account paying for all rents
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    
    /// CHECK: no need to check it out
    #[account(address = INSTRUCTION_ID())]
    pub sysvar_instruction: AccountInfo<'info>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub rent: Sysvar<'info, Rent>,

    #[account(
        seeds = [
        b"state".as_ref(),
        amm.key().as_ref(),
        ],
        bump,
    )]
    pub state: Account<'info, State>,

    #[account(
        seeds = [
        b"amm".as_ref(),
        ],
        bump,
    )]
    pub amm: Account<'info, Amm>,
}

impl<'info> CreateMetadata<'info> {
    pub fn create_metadata(
        &mut self, 
        token: u8,
        bumps: CreateMetadataBumps
    ) -> Result<()> {
        let seeds = &[
            "auth".as_bytes(),
            &[bumps.mint_authority]
        ];

        let signer_seeds = &[&seeds[..]];

        let name: &str;
        let symbol: &str;
        let uri: &str;
        match token {
            0 => {
                name = "Endcoin";
                symbol = "END";
                uri = "https://arweave.net/K-3ZVae8bb_iMFLTZKuO_7CMNLtOc-bmMafhhn_PeF0";
            // Set mint to state
            self.state.mint_a = self.mint.key();

            }
            1 => {
                name = "Gaiacoin";
                symbol = "GAIA";
                uri = "https://arweave.net/aFr3D_1_O4F2cDpE9r_OGP5o6D2OyZgDzlLmBEdUYos";
                // Set mint to state
                self.state.mint_b = self.mint.key();

            }
            _ => return Err(MetadataError::InvalidMetadata.into()), // write custom error 
        };
            // rust API to create a mint with metadata
            CreateV1CpiBuilder::new(&self.token_metadata_program)
            .metadata(&self.metadata.to_account_info())
            .mint(&self.mint.to_account_info(), false)
            .authority(&self.mint_authority.to_account_info())
            .payer(&self.payer.to_account_info())
            .update_authority(&self.mint_authority.to_account_info(), false)
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