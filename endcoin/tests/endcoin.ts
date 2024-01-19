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

const program = anchor.workspace.Endcoin as Program<Endcoin>;
const provider = anchor.getProvider();
const metadata = "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
const seed = new anchor.BN(randomBytes(8));
const auth = anchor.web3.Keypair.generate();
const payer = anchor.web3.Keypair.generate();

let [ammconfig] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("ammconfig"), seed.toBuffer('le', 8)], program.programId);
let [endcoinMint] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("endcoin")], program.programId);
let [gaiacoinMint] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("gaiacoin")], program.programId);
let [lpMint] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("lp"), ammconfig.toBuffer()], program.programId);
let [endcoinMetadata] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("endcoinmetadata")], program.programId);
let [gaiacoinMetadata] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("gaiacoinmetadata")], program.programId);
let [state] =  anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("state")], program.programId);

// vaults
const vaultEndcoin = getAssociatedTokenAddressSync(endcoinMint, payer.publicKey);
const vaultGaiacoin =  getAssociatedTokenAddressSync(gaiacoinMint, payer.publicKey);
const vaultLp =  getAssociatedTokenAddressSync(lpMint, payer.publicKey);






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



    // Add your test here.
    const tx = await program.methods.init(seed).accounts(
      {
        auth: auth.publicKey,
        payer: payer.publicKey,
        endcoinMint,
        gaiacoinMint,
        endcoinMetadata,
        gaiacoinMetadata,
        ammconfig,
        lpMint,
        vaultEndcoin,
        vaultGaiacoin,
        vaultLp,
        state,
        metadataProgram: metadata,
      }
    ).signers([auth, payer]).rpc().catch((err) => {
      console.log("err:", err);
  }).then(confirm).then(log);

    console.log("Your transaction signature", tx);
  });
});
