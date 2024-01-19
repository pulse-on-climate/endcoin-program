use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenInterface, TokenAccount};
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::metadata::{ Metadata, MetadataAccount};


use crate::{State, AmmConfig};

// initialize endcoin 
#[derive(Accounts)]
#[instruction(seed:u64)]
pub struct Init<'info> {
    // SIGNERS // 
    #[account(mut)] pub auth: Signer<'info>,
    #[account(mut)] pub payer: Signer<'info>,
    // MINTS //

    // single pda 
    /// CHECK THIS - used to create pda for endcoin mints
    #[account(
        mut,
        seeds = [b"endcoin".as_ref()],
        bump,
    )] pub token_auth: UncheckedAccount<'info>,

    #[account(
        init,
        payer = payer,
        mint::decimals = 6,
        mint::authority = token_auth,
        mint::freeze_authority = token_auth,
        seeds = [b"endcoin".as_ref()],
        bump
    )] pub endcoin_mint: InterfaceAccount<'info, Mint>,
    
    #[account(
        init,
        payer = payer,
        mint::decimals = 6,
        mint::authority = token_auth,
        mint::freeze_authority = token_auth,
        seeds = [b"gaiacoin".as_ref()],
        bump
    )] pub gaiacoin_mint: InterfaceAccount<'info, Mint>,
    
    #[account(
        init,
        payer = payer,
        seeds = [b"lp", ammconfig.key().as_ref()],
        bump,
        mint::decimals = 6,
        mint::authority = auth,
    )] pub lp_mint: InterfaceAccount<'info, Mint>,

    // METADATA //
    #[account(mut)] pub endcoin_metadata: Account<'info, MetadataAccount>,
    #[account(mut)] pub gaiacoin_metadata: Account<'info, MetadataAccount>,
    
    // STATES / CONFIGS // 
    //  STATE
    #[account(
        init_if_needed,
        payer=payer,
        seeds = [b"state".as_ref()],
        bump,
        space = State::INIT_SPACE
    )] pub state: Account<'info, State>,

    // AMMCONFIG
    #[account(init,
        payer = payer,
        seeds = [b"ammconfig", seed.to_le_bytes().as_ref()],
        bump,
        space = AmmConfig::INIT_SPACE   
        )]
        pub ammconfig: Account<'info, AmmConfig>, 

    // PROGRAMS // 
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>, 
    pub rent: Sysvar<'info, Rent>,
    pub metadata_program: Program<'info, Metadata>,
    // 
    #[account(
        init,
        payer = payer,
        associated_token::mint = lp_mint,
        associated_token::authority = auth,
    )] pub vault_lp: InterfaceAccount<'info, TokenAccount>,

        #[account(
            init,
            payer = payer,
            associated_token::mint = endcoin_mint,
            associated_token::authority = auth,
        )]
        pub vault_endcoin: InterfaceAccount<'info, TokenAccount>,
        #[account(
            init,
            payer = payer,
            associated_token::mint = gaiacoin_mint,
            associated_token::authority = auth,
        )]
        pub vault_gaiacoin: InterfaceAccount<'info, TokenAccount>,
}

impl<'info> Init<'info> {

    pub fn init(
        &mut self, 
        bumps: &InitBumps
    ) -> Result<()> {
       msg!("Initializing Endcoin Mint Account");
        // // endcoin mint
        // msg!("Initializing Endcoin Mint Account");
        // msg!("mint: {}", self.endcoin_mint.key());   
        // Token::initialize_mint(
        //     CpiContext::new(
        //         self.token_program.to_account_info(),
        //         token::InitializeMint {
        //             mint: self.endcoin_mint.to_account_info(),
        //             rent: self.rent.to_account_info(),
        //         },
        //     ), 
        //     2, 
        //     &self.auth.key(),
        //     Some(&self.auth.key())
        // )?;

        // // gaiacoin mint
        // msg!("Initializing Gaiacoin Mint Account");
        // msg!("mint: {}", self.gaiacoin_mint.key());   
        // token::initialize_mint(
        //     CpiContext::new(
        //         self.token_program.to_account_info(),
        //         token::InitializeMint {
        //             mint: self.gaiacoin_mint.to_account_info(),
        //             rent: self.rent.to_account_info(),
        //         },
        //     ), 
        //     2, 
        //     &self.auth.key(),
        //     Some(&self.auth.key())
        // )?;
        // state
        // self.state.set_inner(
        //     State {
        //         endcoin_mint_bump: bumps.endcoin_mint, 
        //         gaiacoin_mint_bump: bumps.gaiacoin_mint,
        //         state_bump: bumps.state
        //     }

        // );
        Ok(())
    }
    




}
    // pub fn create_endcoin_metadata(
    //     &mut self,
    //     name: String,
    //     symbol: String,
    //     uri: String
    //    ) -> Result<()> {
    //     msg!("Creating seeds");

    //            let seeds = &["endcoin".as_bytes(),&[self.state.endcoin_metadata_bump],
    //            ];
    //            msg!("Create Endcoin Metadata Account");
    //             // create metadata PDA
    //            create_metadata_accounts_v3(
    //                CpiContext::new_with_signer(
    //                    self.metadata_program.to_account_info(),
    //                    CreateMetadataAccountsV3 {
    //                        payer: self.payer.to_account_info(),
    //                        mint: self.endcoin_mint.to_account_info(),
    //                        metadata: self.endcoin_metadata.to_account_info(),
    //                        mint_authority: self.auth.to_account_info(),
    //                        update_authority: self.auth.to_account_info(),
    //                        system_program: self.system_program.to_account_info(),
    //                        rent: self.rent.to_account_info(),
    //                    },
    //                    &[&seeds[..]],
    //                ),
    //                DataV2 {
    //                     name,
    //                     symbol,
    //                     uri,
    //                     seller_fee_basis_points: 0,
    //                     creators: None,
    //                     collection: None,
    //                     uses: None,
    //                },
    //                true, // is mutable
    //                true, // is initialized
    //                None, // collection detials
    //            )?;
       
    //            Ok(())
    //        }
