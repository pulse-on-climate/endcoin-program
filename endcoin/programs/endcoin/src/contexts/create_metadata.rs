use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    metadata::{create_metadata_accounts_v3, CreateMetadataAccountsV3, Metadata},
    token::{burn, mint_to, Burn, Mint, MintTo, Token, TokenAccount},
};

use anchor_spl::metadata::mpl_token_metadata::types::DataV2;

use solana_program::{pubkey, pubkey::Pubkey};


use crate::{
    errors::*,
    state::{EndcoinMetadata, GaiacoinMetadata, Pool}
};

#[derive(Accounts)]
pub struct CreateMetadata<'info> {

    #[account(
        mut,
        seeds = [b"endcoin"],
        bump,
    )]
    pub mint_a: Box<Account<'info, Mint>>,
    #[account(
        mut,
        seeds = [b"gaiacoin"],
        bump,
    )]
    pub mint_b: Box<Account<'info, Mint>>,

    /// CHECK: Using "address" constraint to validate metadata account address
    #[account(
        init,
        seeds = [b"endcoin_metadata".as_ref()],
        bump,
        payer = payer,
        space = EndcoinMetadata::LEN
    )]
    pub endcoin_metadata: UncheckedAccount<'info>,
    /// CHECK: Using "address" constraint to validate metadata account address
    #[account(
        init,
        seeds = [b"gaiacoin_metadata".as_ref()],
        bump,
        payer = payer,
        space = GaiacoinMetadata::LEN
    )]
    pub gaiacoin_metadata: UncheckedAccount<'info>,
    #[account(mut)]
    pub authority: Signer<'info>,
    /// The account paying for all rents
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub token_metadata_program: Program<'info, Metadata>,
}

impl<'info> CreateMetadata<'info> {

pub fn create_endcoin_metadata(
    &mut self,
    bumps: CreateMetadataBumps
) -> Result<()> {
    // SETUP DATA // 
    let uri= "https://endcoin.com".to_string();
    let name = "Endcoin".to_string();
    let symbol = "END".to_string()  ;
    let metadata_account = &self.endcoin_metadata;
    let mint_account =  &self.mint_a;
    let bump = bumps.mint_a;
    // SETUP DATA // 

    // PDA seeds and bump to "sign" for CPI
    let seeds = b"endcoin";
    let bump = bump;
    let signer: &[&[&[u8]]] = &[&[seeds, &[bump]]];

    // On-chain token metadata for the mint
    let data_v2 = DataV2 {
        name: name,
        symbol: symbol,
        uri: uri,
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    // CPI Context
    let cpi_ctx = CpiContext::new_with_signer(
        self.token_metadata_program.to_account_info(),
        CreateMetadataAccountsV3 {
            // the metadata account being created
            metadata: metadata_account.to_account_info(),
            // the mint account of the metadata account
            mint: mint_account.to_account_info(),
            // the mint authority of the mint account
            mint_authority: mint_account.to_account_info(),
            // the update authority of the metadata account
            update_authority: mint_account.to_account_info(),
            // the payer for creating the metadata account
            payer: self.payer.to_account_info(),
            // the system program account
            system_program: self.system_program.to_account_info(),
            // the rent sysvar account
            rent: self.rent.to_account_info(),
        },
        signer,
    );

    create_metadata_accounts_v3(
        cpi_ctx, // cpi context
        data_v2, // token metadata
        true,    // is_mutable
        true,    // update_authority_is_signer
        None,    // collection details
    )?;

    Ok(())
}

pub fn create_gaiacoin_metadata(
    &mut self,
    bumps: CreateMetadataBumps
) -> Result<()> {
    // SETUP DATA // 
    let uri= "https://gaiacoin.com".to_string();
    let name = "Gaiacoin".to_string();
    let symbol = "GAIA".to_string()  ;
    let metadata_account = &self.gaiacoin_metadata;
    let mint_account =  &self.mint_b;
    let bump = bumps.mint_b;
    // SETUP DATA // 

    // PDA seeds and bump to "sign" for CPI
    let seeds = b"gaiacoin";
    let bump = bump;
    let signer: &[&[&[u8]]] = &[&[seeds, &[bump]]];

    // On-chain token metadata for the mint
    let data_v2 = DataV2 {
        name: name,
        symbol: symbol,
        uri: uri,
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    // CPI Context
    let cpi_ctx = CpiContext::new_with_signer(
        self.token_metadata_program.to_account_info(),
        CreateMetadataAccountsV3 {
            // the metadata account being created
            metadata: metadata_account.to_account_info(),
            // the mint account of the metadata account
            mint: mint_account.to_account_info(),
            // the mint authority of the mint account
            mint_authority: mint_account.to_account_info(),
            // the update authority of the metadata account
            update_authority: mint_account.to_account_info(),
            // the payer for creating the metadata account
            payer: self.payer.to_account_info(),
            // the system program account
            system_program: self.system_program.to_account_info(),
            // the rent sysvar account
            rent: self.rent.to_account_info(),
        },
        signer,
    );

    create_metadata_accounts_v3(
        cpi_ctx, // cpi context
        data_v2, // token metadata
        true,    // is_mutable
        true,    // update_authority_is_signer
        None,    // collection details
    )?;

    Ok(())
}



}