use anchor_lang::prelude::*;

#[account]
pub struct State {
    // pub endcoin_metadata_bump: u8,
    // pub gaiacoin_metadata_bump: u8,
    pub endcoin_mint_bump: u8,
    pub gaiacoin_mint_bump: u8,
    pub state_bump: u8,
}

impl Space for State {
    const INIT_SPACE: usize =  8 + 8 + 32*2 + 2 + 1 + 1 + 1 + 1 + 1;
}

impl State {
    pub fn init(
        &mut self,
        auth_bump: u8,

        // endcoin_metadata_bump: u8,
        // gaiacoin_metadata_bump: u8,
        endcoin_mint_bump: u8,
        gaiacoin_mint_bump: u8,
        state_bump: u8
    ) -> Result<()> {
        // self.endcoin_metadata = endcoin_metadata;
        // self.gaiacoin_metadata = gaiacoin_metadata;
        // self.endcoin_metadata_bump = endcoin_metadata_bump;
        // self.gaiacoin_metadata_bump = gaiacoin_metadata_bump;


        Ok(())
    }
}