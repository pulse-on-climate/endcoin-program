import * as anchor from "@coral-xyz/anchor";
import Big from "big.js";
import { IDL, Endcoin } from "../target/types/endcoin";
import { 
  PublicKey, 
  Keypair,
  Commitment,
  Connection, 
  LAMPORTS_PER_SOL, 
  SYSVAR_INSTRUCTIONS_PUBKEY,
  SystemProgram
} from "@solana/web3.js";
import {
  AggregatorAccount,
  SwitchboardProgram,
} from "@switchboard-xyz/solana.js";

import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import wallet_key from "./keys/wba-wallet.json"
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

import endcoin_key from "../tests/keys/ENDxPmLfBBTVby7DBYUo4gEkFABQgvLP2LydFCzGGBee.json"
import gaiacoin_key from "../tests/keys/GAiAxUPQrUaELAuri8tVC354bGuUGGykCN8tP4qfCeSp.json"
import pulse_key from "../tests/keys/PLSxiYHus8rhc2NhXs2qvvhAcpsa4Q3TzTCi3o8xAEU.json"
import the_keypair from "../tests/keys/keyvSSnFs5p6ya3wGkx1VkJdhP1Xa8VxBhVLg1d1FUK.json"

let latestValue = 21.00;

const AGGREGATOR_PUBKEY = new PublicKey(
  "GfQVY4j7mjd4gcJJEe4rkFsSQxdHLMNTo36dWCdhg64S"
);

describe("Endcoin", () => {
  // Helpers
  const confirm = async (signature: string): Promise<string> => {
    const block = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature,
      ...block,
    })
    return signature
  }

  const log = async(signature: string): Promise<string> => {
    console.log(`Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=${connection.rpcEndpoint}`);
    return signature;
  }

// async function getTemp() {
//   let SwitchboardPrograms = await SwitchboardProgram.load(
//     new Connection("https://api.devnet.solana.com")
//   );

//   const aggregatorAccount = new AggregatorAccount(SwitchboardPrograms, AGGREGATOR_PUBKEY);

//   const result: Big | null = await aggregatorAccount.fetchLatestValue();
//   if (result === null) {
//     throw new Error("Aggregator holds no value");
//   }
//   console.log(result.toString());
//   latestValue = result;
//   } 
// getTemp(); // call it

  // Configure the client to use the devnet cluster.
  const keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(wallet_key)); // replace with wallet
  
  const commitment: Commitment = "confirmed"; // processed, confirmed, finalized
  const connection = new Connection("https://api.devnet.solana.com");
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), { commitment });

  const programId = new PublicKey("G6zBsKfxC1sweqbfa1pYnDPa79UGKS5VtqnrJ1jPc9AP");

  const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  const program = new anchor.Program<Endcoin>(IDL, programId, provider);
  
  // Variables for metadata setup
  let endcoin = 0;
  let gaiacoin = 1;

  // KEYS //
  let mintA = anchor.web3.Keypair.fromSecretKey(new Uint8Array(endcoin_key)); // replace with endcoin file
  let mintB = anchor.web3.Keypair.fromSecretKey(new Uint8Array(gaiacoin_key)); // replace with gaiacoin file
  let mintLp = anchor.web3.Keypair.fromSecretKey(new Uint8Array(pulse_key)); // replace with pulse file
  
  let admin = mintA; // replace with my wallet (keypair)
  let id = mintA.publicKey;

  let metadataA = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"), 
      TOKEN_METADATA_PROGRAM_ID.toBuffer(), 
      mintA.publicKey.toBuffer()
    ], 
    TOKEN_METADATA_PROGRAM_ID)[0];

  let metadataB = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"), 
      TOKEN_METADATA_PROGRAM_ID.toBuffer(), 
      mintB.publicKey.toBuffer()
    ], 
      TOKEN_METADATA_PROGRAM_ID)[0];

  let mintAuthority = PublicKey.findProgramAddressSync([Buffer.from("auth")], program.programId)[0];
  let amm = PublicKey.findProgramAddressSync([Buffer.from("amm")], program.programId)[0];


  
  let fee = 500;
  // SST // 
  const sst = PublicKey.findProgramAddressSync(
    [
      Buffer.from("seaSurfaceTemperature"),
    ],
    program.programId)[0];

  // STATE //
  const stateKey = PublicKey.findProgramAddressSync(
    [
      Buffer.from("state"),
      amm.toBuffer(),
    ],
    program.programId)[0];

  // POOL // 
  const poolKey = PublicKey.findProgramAddressSync(
    [
      amm.toBuffer(),
      mintA.publicKey.toBuffer(),
      mintB.publicKey.toBuffer(),
      
    ],
    program.programId)[0];

  // POOL AUTH //
  const poolAuthority = PublicKey.findProgramAddressSync(
    [
      //amm.toBuffer(),
      mintA.publicKey.toBuffer(),
      mintB.publicKey.toBuffer(),
      Buffer.from("authority"),
    ],
    program.programId)[0];

  // POOL ATAS //
  let poolAccountA = getAssociatedTokenAddressSync(
    mintA.publicKey,
    poolAuthority,
    true
  );

  let poolAccountB = getAssociatedTokenAddressSync(
    mintB.publicKey,
    poolAuthority,
    true
  );
  
  let liquidityAccount = getAssociatedTokenAddressSync(
    mintLp.publicKey,
    mintAuthority,
    true
  );

  // Instructions
  it("Airdrop", async () => {
    await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL * 10).then(confirm).then(log)
  })

  it("AMM Creation", async () => {
    await program.methods
      .createAmm(id, fee)
      .accounts({ 
        amm: amm, 
        admin: admin.publicKey, 
        state: stateKey,
        payer: keypair.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([keypair])
      .rpc({skipPreflight: true});
  });

  it("Create Endcoin Metadata", async () => {
    
    await program.methods
      .createMetadata(endcoin).accounts({
        mint: mintA.publicKey,
        metadata: metadataA,
        mintAuthority,
        payer: keypair.publicKey,
        state: stateKey,
        amm: amm,
        systemProgram: SystemProgram.programId,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        sysvarInstruction: SYSVAR_INSTRUCTIONS_PUBKEY,
      }).signers([mintA, keypair]).rpc({ skipPreflight: true }).then(confirm).then(log);
      
  });

  it("Create Gaiacoin Metadata", async () => {
    await program.methods
      .createMetadata(gaiacoin).accounts({
        mint: mintB.publicKey,
        metadata: metadataB,
        mintAuthority,
        payer: keypair.publicKey,
        state: stateKey,
        amm: amm,
        systemProgram: SystemProgram.programId,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        sysvarInstruction: SYSVAR_INSTRUCTIONS_PUBKEY
      }).signers([mintB, keypair]).rpc({ skipPreflight: true }).then(confirm).then(log);
      // console log out the mint address for the next test
  });

  it("Create Pool", async () => {
    await program.methods
      .createPool()
      .accounts({
        amm: amm,
        state: stateKey,
        pool: poolKey,
        poolAuthority: poolAuthority,
        mintLiquidity: mintLp.publicKey,
        mintAuthority: mintAuthority,
        mintA: mintA.publicKey,
        mintB: mintB.publicKey,
        poolAccountA: poolAccountA,
        poolAccountB: poolAccountB,
      }).signers([mintLp, keypair]).rpc({ skipPreflight: true }).then(confirm).then(log);

      // console log the new pool a and pool b token amounts
      let PoolABalance = await connection.getTokenAccountBalance(
        poolAccountA
      );
      let PoolBBalance = await connection.getTokenAccountBalance(
        poolAccountB
      );
      console.log(`Pool A Balance: ${PoolABalance.value.amount}`);
      console.log(`Pool B Balance: ${PoolBBalance.value.amount}`);
  });
  it("Create SST", async () => {
    await program.methods
      .createSst()
      .accounts({
        sst: sst,
        payer: keypair.publicKey,
        systemProgram: SystemProgram.programId,
      }).signers([keypair]).rpc({ skipPreflight: true }).then(confirm).then(log);

  });
});