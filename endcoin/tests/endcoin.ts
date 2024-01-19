// Anchor Imports
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Endcoin } from "../target/types/endcoin";
import { MPL_TOKEN_METADATA_PROGRAM_ID } from "@metaplex-foundation/mpl-token-metadata";
import { randomBytes } from "crypto";
import { BN } from "bn.js";
import wallet from "../wba-wallet.json"
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import bs58 from "bs58";

const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
const program = anchor.workspace.Endcoin as Program<Endcoin>;
const provider = anchor.getProvider();
const seed = new anchor.BN(randomBytes(8));

const auth = anchor.web3.Keypair.generate();
const payer = anchor.web3.Keypair.generate();

// amm and state configs
let [ammconfig] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("ammconfig"), seed.toBuffer('le', 8)], program.programId);
let [state] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("state")], program.programId);
// // token auth
let [tokenAuth] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("endcoin")], program.programId);
// // mints
// let [endcoinMint] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("endcoin")], program.programId);
// let [gaiacoinMint] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("gaiacoin")], program.programId);
// let [lpMint] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("lp"), ammconfig.toBuffer()], program.programId);
// // metadata 
// let [endcoinMetadata] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("endcoinmetadata")], program.programId);
// let [gaiacoinMetadata] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("gaiacoinmetadata")], program.programId);

// mints
let endcoinMint =  anchor.web3.Keypair.generate();
let gaiacoinMint =  anchor.web3.Keypair.generate();
let lpMint =  anchor.web3.Keypair.generate();
// metadata 
let endcoinMetadata =  anchor.web3.Keypair.generate();
let gaiacoinMetadata =  anchor.web3.Keypair.generate();

// vaults
const vaultEndcoin = getAssociatedTokenAddressSync(endcoinMint.publicKey, payer.publicKey);
const vaultGaiacoin =  getAssociatedTokenAddressSync(gaiacoinMint.publicKey, payer.publicKey);
const vaultLp =  getAssociatedTokenAddressSync(lpMint.publicKey, payer.publicKey);


const getMetadata = async (mint: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey> => {
  return (
    anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )
  )[0];
};





describe("endcoin", () => {


  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  // Helper Scripts
  const confirm = async (signature: string): Promise<string> => {

    const block = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature,
      ...block
    })
    return signature
  }
  
  const log = async(signature: string): Promise<string> => {
    console.log(`Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
    return signature;
  }
  it("Is initialized!", async () => {


    // use this to get the metadata assigned to the mint. 
    // const metadata = await getMetadata(mint);
    // console.log("Metadata", metadata.toBase58());

    // Add your test here.
    const tx = await program.methods.init().accounts(
      {
        auth: auth.publicKey,
        payer: payer.publicKey,
        tokenAuth,
        endcoinMint: endcoinMint.publicKey,
        gaiacoinMint: gaiacoinMint.publicKey,
        endcoinMetadata: endcoinMetadata.publicKey,
        gaiacoinMetadata: gaiacoinMetadata.publicKey,
        ammconfig,
        lpMint: lpMint.publicKey,
        vaultEndcoin,
        vaultGaiacoin,
        vaultLp,
        state,
        metadataProgram: TOKEN_METADATA_PROGRAM_ID,
      }
    ).signers([auth, payer]).rpc({skipPreflight: true}).catch((err) => {
      console.log("err:", err);
  })
  
  .then(confirm).then(log);

    console.log("Your transaction signature", tx);
  });
});
