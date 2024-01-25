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

describe("Endcoin", () => {
  const commitment: Commitment = "confirmed"; // processed, confirmed, finalized
  const connection = new Connection("http://localhost:8899", {
      commitment,
      wsEndpoint: "ws://localhost:8900/",
  });
  // Configure the client to use the local cluster.
  const keypair = Keypair.generate();
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), { commitment });
  const programId = new PublicKey("7Q7HrN7adYXwBckBnY8CcQ78tR7GaCkrbS6R3pj48xiC");
  const program = new anchor.Program<Endcoin>(IDL, programId, provider);
  const TOKEN_METADATA_PROGRAM_ID = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

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


  // Instructions
  it("Airdrop", async () => {
    await connection.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL * 10).then(confirm).then(log)
  })

  it("Create Endcoin Metadata", async () => {
    
    await program.methods
      .createMetadata(endcoin).accounts({
        mint: mintA.publicKey,
        metadata: metadataA,
        mintAuthority,
        payer: keypair.publicKey,
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
        systemProgram: SystemProgram.programId,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        sysvarInstruction: SYSVAR_INSTRUCTIONS_PUBKEY
      }).signers([mintB, keypair]).rpc({ skipPreflight: true }).then(confirm).then(log);
  });
});