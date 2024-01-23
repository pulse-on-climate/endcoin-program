import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
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

  beforeEach(async () => {
    values = createValues();

    await program.methods
      .createAmm(values.id, values.fee)
      .accounts({ amm: values.ammKey, admin: values.admin.publicKey })
      .rpc();

    await mintingTokens({
      connection,
      creator: values.admin,
      mintAKeypair: values.mintAKeypair,
      mintBKeypair: values.mintBKeypair,
    });
  });

  it("Create Endcoin Metadata", async () => {
    await program.methods
      .createEndcoinMetadata()
      .accounts({
        mintA: values.mintAKeypair.publicKey,
        mintB: values.mintBKeypair.publicKey,
        payer: values.holderAccountA,
        endcoinMetadata: values.endcoinMetadata,
        gaiacoinMetadata: values.gaiacoinMetadata,
        authority: values.admin.publicKey,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .rpc({ skipPreflight: true });
  });

  it("Create Gaiacoin Metadata", async () => {
    await program.methods
      .createGaiacoinMetadata()
      .accounts({
        mintA: values.mintAKeypair.publicKey,
        mintB: values.mintBKeypair.publicKey,
        payer: values.poolAuthority,
        endcoinMetadata: values.endcoinMetadata,
        gaiacoinMetadata: values.gaiacoinMetadata,
        authority: values.admin.publicKey,
        tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
      })
      .rpc({ skipPreflight: true });
  });

  xit("Invalid mints", async () => {
    values = createValues({
      mintBKeypair: values.mintAKeypair,
      poolKey: PublicKey.findProgramAddressSync(
        [
          values.id.toBuffer(),
          values.mintAKeypair.publicKey.toBuffer(),
          values.mintBKeypair.publicKey.toBuffer(),
        ],
        program.programId
      )[0],
      poolAuthority: PublicKey.findProgramAddressSync(
        [
          values.id.toBuffer(),
          values.mintAKeypair.publicKey.toBuffer(),
          values.mintBKeypair.publicKey.toBuffer(),
          Buffer.from("authority"),
        ],
        program.programId
      )[0],
    });

    await expectRevert(
      program.methods
        .createPool()
        .accounts({
          amm: values.ammKey,
          pool: values.poolKey,
          poolAuthority: values.poolAuthority,
          mintLiquidity: values.mintLiquidity,
          mintA: values.mintAKeypair.publicKey,
          mintB: values.mintBKeypair.publicKey,
          poolAccountA: values.poolAccountA,
          poolAccountB: values.poolAccountB,
        })
        .rpc()
    );
  });
});
