import { Endcoin } from "../target/types/endcoin";
import { expect } from "chai";
import { TestValues, createValues, expectRevert } from "./utils";
import { Program } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";

let ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);
  const program = anchor.workspace.Endcoin as Program<Endcoin>;

  let values: TestValues;
  values = createValues();

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
  // Create AMM  
  async function create_amm() {
    await program.methods
      .createAmm(
        values.id, 
        values.fee
      )
      .accounts({ 
        //amm: values.ammKey, 
        admin: values.admin.publicKey 
      })
      .rpc({skipPreflight: true}).then(confirm).then(log);

    const ammAccount = await program.account.amm.fetch(values.ammKey);
    console.log("amm Account: " + ammAccount);
    expect(ammAccount.id.toString()).to.equal(values.id.toString());
    expect(ammAccount.admin.toString()).to.equal(
      values.admin.publicKey.toString()
    );
    expect(ammAccount.fee.toString()).to.equal(values.fee.toString());
  };

  create_amm();