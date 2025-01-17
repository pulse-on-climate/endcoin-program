import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SendTransactionError } from "@solana/web3.js";
import { Endcoin } from "./target/types/endcoin";
import { expect } from "chai";
import { TestValues, createValues, expectRevert } from "./tests/utils";

describe("Create AMM", () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);

  const program = anchor.workspace.Endcoin as Program<Endcoin>;

  let values: TestValues;

  beforeEach(() => {
    values = createValues();
  });


  it("Initialize AMM", async () => {
    await program.methods
      .createAmm(values.id, values.fee)
      .accountsStrict({
        amm,
        admin: admin.publicKey,
        program: program.programId,
        programData: programData, // Add this line
        authority: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer, admin])
      .rpc();

    const ammAccount = await program.account.amm.fetch(values.ammKey);
    expect(ammAccount.id.toString()).to.equal(values.id.toString());
    expect(ammAccount.admin.toString()).to.equal(
      values.admin.publicKey.toString()
    );
    expect(ammAccount.fee.toString()).to.equal(values.fee.toString());
  });

  it("Invalid fee", async () => {
    values.fee = 10000;

    await expectRevert(
      program.methods
        .createAmm(values.id, values.fee)
        .accounts({ amm: values.ammKey, admin: values.admin.publicKey })
        .rpc()
    );
  });
});