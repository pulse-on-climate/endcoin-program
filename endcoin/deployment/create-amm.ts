import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Endcoin } from "../target/types/endcoin";
import { expect } from "chai";
import { TestValues, createValues, expectRevert } from "./utils";

let ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);

  const program = anchor.workspace.Endcoin as Program<Endcoin>;

  let values: TestValues;
  values = createValues();
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
  async function create_amm() {
    await program.methods
      .createAmm(values.id, values.fee)
      .accounts({ amm: values.ammKey, admin: values.admin.publicKey })
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