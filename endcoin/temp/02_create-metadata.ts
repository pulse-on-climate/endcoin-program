import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { Endcoin } from "../target/types/endcoin";
import { TestValues, createValues, expectRevert, mintingTokens } from "./utils";
import { Metaplex } from "@metaplex-foundation/js";
import { getMint, getAssociatedTokenAddressSync } from "@solana/spl-token";
// metaplex token metadata program ID
const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

describe("Create metadata", () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);

  const program = anchor.workspace.Endcoin as Program<Endcoin>;

  let values: TestValues;

  beforeEach(() => {
    values = createValues();
  });



let mintAKeypair = anchor.web3.Keypair.generate();

let mintBKeypair = anchor.web3.Keypair.generate();

let authority = anchor.web3.Keypair.generate();

let payer = anchor.web3.Keypair.generate();

let metadata = anchor.web3.Keypair.generate();

let endcoin = 0;
let gaiacoin = 1;

  // confirm transaction helper
  const confirm = async (signature: string): Promise<string> => {

    const block = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature,
      ...block
    })
    return signature
  }
    // log transaction helper
    const log = async(signature: string): Promise<string> => {
      console.log(`Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=devnet`);
      return signature;
    }


  it("Airdrop", async () => {
    await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL * 10)
    .then(confirm)
    .then(log)
  })

  it("Create Endcoin Metadata", async () => {
    console.log("Mint A: " + mintAKeypair.publicKey.toBase58())
    console.log("Mint B: " + mintBKeypair.publicKey.toBase58())
    console.log("Authority: " + authority.publicKey.toBase58())
    console.log("Payer: " + payer.publicKey.toBase58())

    await program.methods
      .createMetadata(endcoin).accounts({
        mint: mintAKeypair.publicKey,
        metadata: metadata.publicKey,
        mintAuthority: authority.publicKey,
        payer: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        sysvarInstruction: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
      }).signers([mintAKeypair, payer])
      .rpc({ skipPreflight: true });
  });

  it("Create Gaiacoin Metadata", async () => {
    await program.methods
      .createMetadata(gaiacoin).accounts({
        mint: mintBKeypair.publicKey,
        metadata: metadata.publicKey,
        mintAuthority: authority.publicKey,
        payer: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
        sysvarInstruction: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY
      }).signers([mintBKeypair, payer])
      .rpc({ skipPreflight: true });
  });

});

