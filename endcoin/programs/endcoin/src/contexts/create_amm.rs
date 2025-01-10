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
            id.as_ref(),
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

#[derive(Accounts)]
#[instruction(new_admin: Pubkey)]
pub struct UpdateAmm<'info> {
    #[account(
        mut,
        seeds = [
            AMM_SEED,
            amm.id.as_ref()
        ],
        bump,
    )]
    pub amm: Account<'info, Amm>,

    #[account(
        constraint = admin.is_signer @ AmmError::UnauthorizedAdmin
    )]
    pub admin: Signer<'info>,
}





impl<'info> CreateAmm<'info> {
    pub fn create_amm(
        &mut self, 
        id: Pubkey, 
        fee: u16
    ) -> Result<()> {

        // Check if the AMM has already been created
        if self.amm.created {
            msg!("AMM has already been created, cannot create again");
            return Err(AmmError::AlreadyCreated.into());
        } else {

            // set inner values of amm
            self.amm.set_inner(
                Amm {
                    id,
                    admin: self.admin.key(),
                    fee,
                    created: true,
                    is_immutable: false, // Defaulting to false when created
                }
            );
            
            msg!("AMM Created, setting created state to True");
        
            Ok(())
        
        }
    }
    
}

impl<'info> UpdateAmm<'info> {
    pub fn update_admin(
        &mut self,
        new_admin: Pubkey,
    ) -> Result<()> {
        
        // Check if the AMM has already been created by checking if the id is not the default value
        if self.amm.id == Pubkey::default() {
            msg!("AMM has not been created, cannot update admin");
            return Err(AmmError::NotCreated.into());
        }
        // Check if the AMM is immutable. If it is, then it cannot be updated.
        if self.amm.is_immutable {
            msg!("AMM Is now immutable. Cannot update.");
            return Err(AmmError::UnauthorizedAdmin.into());
        }

        // Add in a check for the admin's signature
        if !self.admin.is_signer {
            return Err(AmmError::NotSigner.into());
        }
        
        // Set the new admin
        self.amm.admin = new_admin;
        msg!("Admin Updated");
        Ok(())
    }

    // Function to make the AMM immutable
    pub fn make_immutable(&mut self) -> Result<()> {
        // Check if the current admin is the signer
        if self.admin.key() != self.admin.key() {
            msg!("Unauthorized Admin, Cannot make AMM immutable");
            return Err(AmmError::UnauthorizedAdmin.into());
        }

        // Set the AMM as immutable
        self.amm.is_immutable = true;
        msg!("AMM is now immutable");
        Ok(())
    }
}