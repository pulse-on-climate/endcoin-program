use anchor_lang::prelude::*;

use crate::{errors::*, state::SST};

#[derive(Accounts)]
pub struct CreateSST<'info> {
    #[account(
        init,
        payer = payer,
        space = SST::LEN,
        seeds = [
            b"seaSurfaceTemperature",
        ],
        bump
    )] pub sst: Account<'info, SST>,
    
    /// The account paying for all rents
    #[account(mut)]  pub payer: Signer<'info>,
    
    // System Program
    pub system_program: Program<'info, System>,
}

// IMPL 


impl<'info> CreateSST<'info> {
    pub fn create_sst(
        &mut self
    ) -> Result<()> {
        let sst = &mut self.sst;
        if sst.created == true {
            return Err(SstError::AlreadyInitialized.into());
        } else {
            sst.temperature = 21.000;
            sst.created = true;
        }
        Ok(())
    }
}