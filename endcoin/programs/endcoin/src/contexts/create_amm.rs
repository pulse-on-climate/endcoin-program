use anchor_lang::prelude::*;
use crate::{constants::AMM_SEED, errors::*, program::Endcoin, state::Amm};

#[derive(Accounts)]
#[instruction(id: Pubkey, fee: u16)]
pub struct CreateAmm<'info> {
    // The AMM account
    #[account(
        init,
        payer = authority,
        space = Amm::LEN,
        seeds = [
            AMM_SEED,
            admin.key().as_ref(),
        ],
        bump,
        constraint = fee >= 5 && fee < 10000 @ AmmError::InvalidFee,
    )]
    pub amm: Box<Account<'info, Amm>>,

    /// The admin of the AMM
    #[account(
        constraint = admin.is_signer @ AmmError::UnauthorizedAdmin
    )]
    pub admin: Signer<'info>,
    #[account(constraint = program.programdata_address()? == Some(program_data.key()))]
    pub program: Program<'info, Endcoin>,
    #[account(constraint = program_data.upgrade_authority_address == Some(authority.key()))]
    pub program_data: Account<'info, ProgramData>,
    // The account paying for all rents
    #[account(mut)]
    pub authority: Signer<'info>,
    // Solana ecosystem accounts
    pub system_program: Program<'info, System>,
}

impl<'info> CreateAmm<'info> {
    pub fn create_amm(
        &mut self, 
        id: Pubkey, 
        fee: u16
    ) -> Result<()> {

        if self.amm.created {
            
            msg!("AMM Is Locked, Cannot Create");

            return Err(AmmError::AlreadyCreated.into());
        
        } else {

            // set inner values of amm
            self.amm.set_inner(
                Amm {
                    id,
                    admin: self.admin.key(),
                    fee,
                    created: true
                }
            );
            
            msg!("AMM Created, setting created state to True");
        
            Ok(())
        
        }
    }
}