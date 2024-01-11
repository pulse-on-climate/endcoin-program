use anchor_lang::prelude::*;

declare_id!("4gqKMD7ft5KVishh1NKUmn5L6tCtbZUfpTD4dekVP5uZ");

#[program]
pub mod endcoin_amm {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
