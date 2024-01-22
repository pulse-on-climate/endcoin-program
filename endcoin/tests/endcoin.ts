// Anchor Imports
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Endcoin } from "../target/types/endcoin";
import { randomBytes } from "crypto";
import { BN } from "bn.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import bs58 from "bs58";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";

const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.Endcoin as Program<Endcoin>;

console.log("Provider", provider.connection.getVersion());

const wallet = provider.wallet as NodeWallet

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

// vaults
const vaultEndcoin = getAssociatedTokenAddressSync(endcoinMint.publicKey, payer.publicKey);
const vaultGaiacoin =  getAssociatedTokenAddressSync(gaiacoinMint.publicKey, payer.publicKey);
const vaultLp =  getAssociatedTokenAddressSync(lpMint.publicKey, payer.publicKey);


describe("endcoin", () => {

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

 //Airdrop tokens to both accounts
 xit("Airdrop tokens to auth and payer", async () => {
  const tx_maker = await provider.connection.requestAirdrop(
    payer.publicKey,
    anchor.web3.LAMPORTS_PER_SOL*10
  );
  await provider.connection.confirmTransaction(tx_maker);
  const tx_taker = await provider.connection.requestAirdrop(
    auth.publicKey,
    anchor.web3.LAMPORTS_PER_SOL*10
  );
  await provider.connection.confirmTransaction(tx_taker);
  console.log(`Maker airdrop tx: ${tx_maker}`);
  console.log(`Maker airdrop tx: ${tx_taker}`);
});




  xit("Is initialized!", async () => {
    // use this to get the metadata assigned to the mint. 
    // const metadata = await getMetadata(mint);
    // console.log("Metadata", metadata.toBase58());

    // Add your test here.
    const tx = await program.methods.init().accounts(
      {
        auth: auth.publicKey,
        payer: payer.publicKey,
        endcoinMint: endcoinMint.publicKey,
        gaiacoinMint: gaiacoinMint.publicKey,
        lpMint: lpMint.publicKey,
        vaultEndcoin,
        vaultGaiacoin,
        vaultLp,
      }
    ).signers([auth, payer, lpMint, endcoinMint, gaiacoinMint]).rpc({skipPreflight: true});

    console.log("Your transaction signature", tx);
  });
});
