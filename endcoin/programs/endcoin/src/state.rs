use anchor_lang::prelude::*;
#[account]
#[derive(Default)]
pub struct Amm {

    /// The primary key of the AMM
    pub id: Pubkey,
    /// Account that has admin authority over the AMM
    pub admin: Pubkey,
    /// The LP fee taken on each trade, in basis points
    pub fee: u16,

    pub created: bool
}

impl Amm {

    pub const LEN: usize = 8 + 32 + 32 + 2 + 1;

}

#[account]
#[derive(Default)]
pub struct Pool {

    /// Primary key of the AMM
    pub amm: Pubkey,
    /// Mint of token A - Endcoin
    pub mint_a: Pubkey,
    /// Mint of token B - Gaiacoin
    pub mint_b: Pubkey

}

impl Pool {
    pub const LEN: usize = 8 + 32 + 32 + 32;
}

#[account]
#[derive(Default)]
pub struct SST {
    /// temperature value in degrees celsius
    pub temperature: f64,
    pub created: bool
}
impl SST {
    pub const LEN: usize = 8 + 4 + 1;
}

#[account]
#[derive(Default)]
pub struct State {
    /// Primary key of the AMM
    pub amm: Pubkey,
    /// Mint of token A - Endcoin
    pub mint_a: Pubkey,
    /// Mint of token B - Gaiacoin
    pub mint_b: Pubkey,

}
impl State {
    pub const LEN: usize = 8 + 32*3;
}