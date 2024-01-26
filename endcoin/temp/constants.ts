import * as anchor from "@project-serum/anchor";
import { Keypair, PublicKey } from "@solana/web3.js"


const END_KEYPAIR = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from([123,213,203,196,32,167,27,90,205,131,17,112,87,150,253,228,213,156,185,36,22,195,151,36,246,12,29,123,58,211,50,154,181,165,184,96,196,46,21,72,101,35,240,220,151,137,165,194,160,192,175,89,129,180,248,1,102,86,217,196,235,209,50,70])
  );
const END_MINT = new PublicKey("DE5MiJ8KXbBw3CoqnS99cwJp8zfZgMuJVbeNev9iVcWR");
const GAIA_KEYPAIR = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from([28,208,255,151,131,119,209,243,252,78,167,191,113,203,58,146,212,148,177,184,121,211,121,253,31,165,175,186,135,231,234,69,104,172,15,55,197,77,7,130,29,194,65,165,73,183,241,58,159,190,223,172,36,206,70,87,51,96,192,60,150,211,176,38])
  );
const GAIA_MINT = new PublicKey("DE5MiJ8KXbBw3CoqnS99cwJp8zfZgMuJVbeNev9iVcWR");
const LP_KEYPAIR = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from([227,99,89,112,107,125,161,30,84,179,2,43,133,244,180,226,101,13,103,99,40,32,18,6,214,95,170,204,114,211,5,97,157,157,89,15,9,186,183,88,6,55,226,59,18,197,67,52,136,78,254,123,115,70,236,154,113,152,108,69,110,252,45,8])
  );
const LP_MINT = new PublicKey("BcGAjXySRzjb1dk4BwouprgZbiwZw6bF9wAmMDnNNatX");


const AMM = PublicKey.findProgramAddressSync(
    [Buffer.from("amm")],
    anchor.workspace.Endcoin.programId
  )[0];

const MINT_AUTHORITY = PublicKey.findProgramAddressSync(
    [Buffer.from("auth")],
    anchor.workspace.Endcoin.programId
  )[0];
  const POOL = PublicKey.findProgramAddressSync(
    [AMM.toBuffer(),
        END_KEYPAIR.publicKey.toBuffer(),
        GAIA_KEYPAIR.publicKey.toBuffer(),],
    anchor.workspace.Endcoin.programId
  )[0];

const ADMIN = new anchor.web3.Keypair();
const ADMIN_PUBKEY = ADMIN.publicKey.toBase58();
const AUTH = new anchor.web3.Keypair();
const METADATA = new PublicKey("E8SNRiQDpcHhvzSrpe27BmEq9j7FKc5CkriUxeJt4QJS");
const payer = new PublicKey("H3B3rW9Qk3F9Y4XH2P9m1Q9D7d8Q5Qw7Z2ZQv1fY4fzZ");
const PAYER_KEYPAIR = anchor.web3.Keypair.fromSecretKey(
    Uint8Array.from([218,67,23,219,60,118,185,105,195,45,121,203,118,173,142,241,33,186,246,55,172,46,115,43,80,27,122,8,29,230,204,64,81,182,181,124,175,66,85,142,55,112,10,73,104,241,32,116,22,7,121,37,37,151,253,167,169,77,74,62,48,74,105,38])
  );
const PAYER_PUBKEY = new PublicKey("BcGAjXySRzjb1dk4BwouprgZbiwZw6bF9wAmMDnNNatX");

export const data = {
    endcoin_keypair: END_KEYPAIR,
    gaiacoin_keypair: GAIA_KEYPAIR,
    lp_keypair: LP_KEYPAIR,
    endcoin_mint: END_MINT,
    gaiacoin_mint: GAIA_MINT,
    lp_mint: LP_MINT,
    amm: AMM,
    pool: POOL,
    admin: ADMIN,
    admin_pubkey: ADMIN_PUBKEY,
    mint_authority: MINT_AUTHORITY,
    metadata: METADATA,
    payer: PAYER_KEYPAIR,
    payer_pubkey: PAYER_PUBKEY
};