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
import wallet from "../wba-wallet.json"
import { bs58 } from "@project-serum/anchor/dist/cjs/utils/bytes";

const AGGREGATOR_PUBKEY = new PublicKey(
  "3ManFLbuU3QfDoAo6byXqhFndaiopLdyZQaxNJkGyppG"
);
let wallet_keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(wallet));

let latestValue = 21.00;
describe("Endcoin", () => {
async function getTemp() {
  let SwitchboardPrograms = await SwitchboardProgram.load(
    new Connection("https://api.devnet.solana.com")
  );

  //switchboard = await SwitchboardProgram.fromProvider(provider);

  const aggregatorAccount = new AggregatorAccount(SwitchboardPrograms, AGGREGATOR_PUBKEY);

  const result: Big | null = await aggregatorAccount.fetchLatestValue();
  if (result === null) {
    throw new Error("Aggregator holds no value");
  }
  console.log(result.toString());
  latestValue = result;
  } getTemp();




  const commitment: Commitment = "confirmed"; // processed, confirmed, finalized
  
  const connection = new Connection("https://api.devnet.solana.com");
  
  // Configure the client to use the devnet cluster.
  const keypair = Keypair.generate();
  
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), { commitment });
  const programId = new PublicKey("Dm8CMAiXHEcpxsN1p69BGy1veoUvfTbCgjv9eiH3U7eH");
  const program = new anchor.Program<Endcoin>(IDL, programId, provider);
  
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

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

  // Variables for metadata setup
  let endcoin = 0;
  let gaiacoin = 1;

  let mintA = Keypair.generate();
  let metadataA = PublicKey.findProgramAddressSync([Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mintA.publicKey.toBuffer()], TOKEN_METADATA_PROGRAM_ID)[0];
  let mintB = Keypair.generate();
  let metadataB = PublicKey.findProgramAddressSync([Buffer.from("metadata"), TOKEN_METADATA_PROGRAM_ID.toBuffer(), mintB.publicKey.toBuffer()], TOKEN_METADATA_PROGRAM_ID)[0];
  let mintAuthority = PublicKey.findProgramAddressSync([Buffer.from("auth")], program.programId)[0];
  let amm = PublicKey.findProgramAddressSync([Buffer.from("amm")], program.programId)[0];
  let admin = Keypair.generate();
  let id = Keypair.generate().publicKey;
  let fee = 500;
    
  let mintLp = Keypair.generate();

  // STAAAAAAAATE
  const stateKey = PublicKey.findProgramAddressSync(
    [
      Buffer.from("state"),
      amm.toBuffer(),
    ],program.programId)[0];

  // POOOOOOOOOLLLLLLLLLLLLLLL
  const poolKey = PublicKey.findProgramAddressSync(
    [
      amm.toBuffer(),
      mintA.publicKey.toBuffer(),
      mintB.publicKey.toBuffer(),
      
    ],program.programId)[0];

    const poolAuthority = PublicKey.findProgramAddressSync(
      [
        //amm.toBuffer(),
        mintA.publicKey.toBuffer(),
        mintB.publicKey.toBuffer(),
        Buffer.from("authority"),
      ],program.programId)[0];

      const sst = PublicKey.findProgramAddressSync(
        [
          Buffer.from("seaSurfaceTemperature"),
        ],program.programId)[0];

        // POOOOOOL ATAS
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

      let holderAccountA = getAssociatedTokenAddressSync(
        mintA.publicKey,
        admin.publicKey,
        true
      );
      let holderAccountB = getAssociatedTokenAddressSync(
        mintB.publicKey,
        admin.publicKey,
        true
      );
      let liquidityAccount = getAssociatedTokenAddressSync(
        mintLp.publicKey,
        mintAuthority,
        true
      );
      const agg = PublicKey.findProgramAddressSync(
        [
          Buffer.from("switchboard"),
        ],program.programId)[0];

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

  it("Generate Tokens", async () => {

  await program.methods
    .depositLiquidity(latestValue)
    .accounts({
      pool: poolKey,
      poolAuthority: poolAuthority,
      payer: keypair.publicKey,
      mintLiquidity: mintLp.publicKey,
      mintA: mintA.publicKey,
      mintB: mintB.publicKey,
      poolAccountA: poolAccountA,
      poolAccountB: poolAccountB,
      mintAuthority: mintAuthority,
      depositorAccountLiquidity: liquidityAccount,
      sst: sst
    })
    .signers([keypair]).rpc({ skipPreflight: true }).then(confirm).then(log);

      // console log the new pool a and pool b token amounts
      let PoolABalance = await connection.getTokenAccountBalance(
        poolAccountA
      );
      let PoolBBalance = await connection.getTokenAccountBalance(
        poolAccountB
      );
      console.log(`The Temperature: ${latestValue}`);
      console.log(`Pool A Balance: ${PoolABalance.value.amount}`);
      console.log(`Pool B Balance: ${PoolBBalance.value.amount}`);
});
});