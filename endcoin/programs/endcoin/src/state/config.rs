use anchor_lang::prelude::*;

#[account]
pub struct Config {
    pub seed: u64,
    pub authority: Option<Pubkey>,
    pub fee: u16,
    pub locked: bool,
    pub auth_bump: u8,
    pub config_bump: u8,
    pub temperature: f32
}

impl Space for Config {
    const INIT_SPACE: usize = 8 + 8 + (1 + 32) + (2 * 32) + 2 + (3 * 1);
}