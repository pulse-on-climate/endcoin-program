use anchor_lang::prelude::*;
use crate::{errors::*, state::Amm};

#[derive(Accounts)]
#[instruction(id: Pubkey, fee: u16)]
pub struct CreateAmm<'info> {
    #[account(
        init_if_needed,
        payer = payer,
        space = Amm::LEN,
        seeds = [
        b"sample".as_ref(),
        ],
        bump,
        constraint = fee < 10000 @ AmmError::InvalidFee,
    )]
    pub amm: Account<'info, Amm>,

    /// The admin of the AMM
    /// CHECK: Read only, delegatable creation
    pub admin: AccountInfo<'info>,

    /// The account paying for all rents
    #[account(mut)]
    pub payer: Signer<'info>,

    /// Solana ecosystem accounts
    pub system_program: Program<'info, System>,
}


impl<'info> CreateAmm<'info> {
    pub fn create_amm(
        &mut self, 
        id: Pubkey, 
        fee: u16
    ) -> Result<()> {
        
        if self.amm.created == true {
            msg!("AMM Already Exists");
            return Err(AmmError::AlreadyCreated.into());
        } else {
            // set inner values of amm
            self.amm.set_inner(
                Amm {
                    id,
                    admin: self.admin.key(),
                    fee,
                    created: true
                });
            msg!("AMM Created, setting State to True");
        }
            Ok(())
        }
    }