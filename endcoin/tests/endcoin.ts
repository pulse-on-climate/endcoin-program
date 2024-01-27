import * as anchor from "@coral-xyz/anchor";
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
import { sleep } from "@switchboard-xyz/common";
import {
  AggregatorAccount,
  SwitchboardProgram,
} from "@switchboard-xyz/solana.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

const AGGREGATOR_PUBKEY = new PublicKey(
  "FMUPZJEysmzSQCfhY45CoUmbNEdCf639nAfng9bSWGtK"
);

describe("Endcoin", () => {
  const commitment: Commitment = "confirmed"; // processed, confirmed, finalized
  const connection = new Connection("http://localhost:8899", {
      commitment,
      wsEndpoint: "ws://localhost:8900/",
  });
  // Configure the client to use the local cluster.
  const keypair = Keypair.generate();
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), { commitment });
  const programId = new PublicKey("Dm8CMAiXHEcpxsN1p69BGy1veoUvfTbCgjv9eiH3U7eH");
  const program = new anchor.Program<Endcoin>(IDL, programId, provider);
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  let switchboard: SwitchboardProgram;
  let aggregatorAccount: AggregatorAccount;

  before(async () => {
    switchboard = await SwitchboardProgram.fromProvider(provider);
    aggregatorAccount = new AggregatorAccount(switchboard, AGGREGATOR_PUBKEY);
  });
  // Helpers
  const wait = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
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

  // Variables
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
  it("Get the SST value", async () => {
      const aggregator = await aggregatorAccount.loadData();
      const latestValue = AggregatorAccount.decodeLatestValue(aggregator);
  
      const tx = await program.methods
        .readFeed({ maxConfidenceInterval: null })
        .accounts({ aggregator: aggregatorAccount.publicKey, sst: sst})
        .rpc();
  
      await sleep(5000);
  
      const confirmedTxn = await program.provider.connection.getParsedTransaction(
        tx,
        "confirmed"
      );
  
      console.log(JSON.stringify(confirmedTxn?.meta?.logMessages, undefined, 2));
  
    });

  it("Generate Tokens", async () => {
    
  await program.methods
    .depositLiquidity()
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
      console.log(`Pool A Balance: ${PoolABalance.value.amount}`);
      console.log(`Pool B Balance: ${PoolBBalance.value.amount}`);
});
});