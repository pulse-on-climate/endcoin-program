use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::{create_metadata_accounts_v3,
 CreateMetadataAccountsV3, Metadata, mpl_token_metadata, MetadataAccount,
};
use mpl_token_metadata::types::DataV2;

use crate::State;

// initialize endcoin 
#[derive(Accounts)]
#[instruction(seed: u64)]
pub struct Init<'info> {

    #[account(mut)] pub auth: Signer<'info>,
    #[account(mut)] pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        mint::decimals = 6,
        mint::authority = auth,
        mint::freeze_authority = auth,
        seeds = [b"endcoin"],
        bump
    )] pub endcoin_mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = payer,
        mint::decimals = 6,
        mint::authority = auth,
        mint::freeze_authority = auth,
        seeds = [b"gaiacoin"],
        bump
    )] pub gaiacoin_mint: InterfaceAccount<'info, Mint>,

    #[account(
        mut,
        seeds = [
            b"endcoinmetadata".as_ref(),
            metadata_program.key().as_ref(),
            endcoin_mint.key().as_ref(),
        ],
        bump
    )]

    pub endcoin_metadata: Account<'info, MetadataAccount>,
    #[account(
        mut,
        seeds = [
            b"gaiacoinmetadata".as_ref(),
            metadata_program.key().as_ref(),
            gaiacoin_mint.key().as_ref(),
        ],
        bump
    )]

    pub gaiacoin_metadata: Account<'info, MetadataAccount>,
    #[account(
        init,
        payer=payer,
        seeds = [b"state", seed.to_le_bytes().as_ref()],
        bump,
        space = State::INIT_SPACE
    )]
    pub state: Account<'info, State>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>, 
    pub rent: Sysvar<'info, Rent>,
    pub metadata_program: Program<'info, Metadata>,
}

impl<'info> Init<'info> {
    
    pub fn create_endcoin_metadata(
        &mut self,
        name: String,
        symbol: String,
        uri: String
       ) -> Result<()> {
        msg!("Creating seeds");

               let seeds = &["endcoin".as_bytes(),&[self.state.endcoin_metadata_bump],
               ];
               msg!("Create Endcoin Metadata Account");
                // create metadata PDA
               create_metadata_accounts_v3(
                   CpiContext::new_with_signer(
                       self.metadata_program.to_account_info(),
                       CreateMetadataAccountsV3 {
                           payer: self.payer.to_account_info(),
                           mint: self.endcoin_mint.to_account_info(),
                           metadata: self.endcoin_metadata.to_account_info(),
                           mint_authority: self.auth.to_account_info(),
                           update_authority: self.auth.to_account_info(),
                           system_program: self.system_program.to_account_info(),
                           rent: self.rent.to_account_info(),
                       },
                       &[&seeds[..]],
                   ),
                   DataV2 {
                        name,
                        symbol,
                        uri,
                        seller_fee_basis_points: 0,
                        creators: None,
                        collection: None,
                        uses: None,
                   },
                   true, // is mutable
                   true, // is initialized
                   None, // collection detials
               )?;
       
               Ok(())
           }

    pub fn init(&mut self, bumps: &InitBumps
    ) -> Result<()> {
        // method to initialize account state 
        self.state.init(
            self.endcoin_mint.key(),
            self.gaiacoin_mint.key(),
            self.endcoin_metadata.key(), 
            self.gaiacoin_metadata.key(), 
            bumps.endcoin_metadata,
            bumps.gaiacoin_metadata,
            bumps.endcoin_mint, 
            bumps.gaiacoin_mint,
            bumps.state
        )?;

        Ok(())
    }
    
}



