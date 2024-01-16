use anchor_lang::prelude::*;

#[account]
pub struct State {
    pub endcoin_mint: Pubkey,
    pub gaiacoin_mint: Pubkey,
    pub endcoin_metadata: Pubkey,
    pub gaiacoin_metadata: Pubkey,
    pub endcoin_metadata_bump: u8,
    pub gaiacoin_metadata_bump: u8,
    pub endcoin_mint_bump: u8,
    pub gaiacoin_mint_bump: u8,
    pub state_bump: u8,
}

impl Space for State {
    const INIT_SPACE: usize = 8 + 8 + 8 + 8 + 8 + 1 + 1 + 1 + 1 + 1 + 1;
}

impl State {
    pub fn init(
        &mut self,
        endcoin_mint: Pubkey,
        gaiacoin_mint: Pubkey,
        endcoin_metadata: Pubkey,
        gaiacoin_metadata: Pubkey,
        endcoin_metadata_bump: u8,
        gaiacoin_metadata_bump: u8,
        endcoin_mint_bump: u8,
        gaiacoin_mint_bump: u8,
        state_bump: u8
    ) -> Result<()> {
        self.endcoin_mint = endcoin_mint;
        self.gaiacoin_mint = gaiacoin_mint;
        self.endcoin_metadata = endcoin_metadata;
        self.gaiacoin_metadata = gaiacoin_metadata;
        self.endcoin_metadata_bump = endcoin_metadata_bump;
        self.gaiacoin_metadata_bump = gaiacoin_metadata_bump;
        self.endcoin_mint_bump = endcoin_mint_bump;
        self.gaiacoin_mint_bump = gaiacoin_mint_bump;
        self.state_bump = state_bump;
        Ok(())
    }
}