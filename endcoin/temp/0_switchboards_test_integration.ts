import "mocha";

import * as anchor from "@coral-xyz/anchor";
import { AnchorProvider } from "@coral-xyz/anchor";

import { Endcoin } from "../target/types/endcoin";
import { sleep } from "@switchboard-xyz/common";
import {
  AggregatorAccount,
  SwitchboardProgram,
} from "@switchboard-xyz/solana.js";
import { PublicKey } from "@solana/web3.js";
import { BN } from "bn.js";

const AGGREGATOR_PUBKEY = new PublicKey(
  "FMUPZJEysmzSQCfhY45CoUmbNEdCf639nAfng9bSWGtK"
);

describe("switchboard-feed-client test", () => {
  const provider = AnchorProvider.env();
  anchor.setProvider(provider);

  const program: anchor.Program<Endcoin> =
    anchor.workspace.Endcoin;

  let switchboard: SwitchboardProgram;
  let aggregatorAccount: AggregatorAccount;

  before(async () => {
    switchboard = await SwitchboardProgram.fromProvider(provider);
    aggregatorAccount = new AggregatorAccount(switchboard, AGGREGATOR_PUBKEY);
  });

  xit("Reads a Switchboard data feed", async () => {
    const aggregator = await aggregatorAccount.loadData();
    const latestValue = AggregatorAccount.decodeLatestValue(aggregator);

    const tx = await program.methods
      .readFeed({ maxConfidenceInterval: null })
      .accounts({ aggregator: aggregatorAccount.publicKey })
      .rpc();

    await sleep(5000);

    const confirmedTxn = await program.provider.connection.getParsedTransaction(
      tx,
      "confirmed"
    );

    console.log(JSON.stringify(confirmedTxn?.meta?.logMessages, undefined, 2));

    // TODO: Parse logs and make sure it matches the latestValue
  });

  /** Example showing how to read a history buffer on-chain for an existing feed with an existing history buffer with pre-populated samples. (This will only work on devnet) */
  xit("Reads an aggregator history buffer", async () => {
    const aggregator = await aggregatorAccount.loadData();
    
    // TODO: Verify the value in the program logs matches the history samples
    const history = await aggregatorAccount.loadHistory();
    let currentTime = Date.now();
    let timestamp = new BN(currentTime)
    const tx = await program.methods
      .readHistory({ timestamp })
      .accounts({
        aggregator: aggregatorAccount.publicKey,
        historyBuffer: aggregator.historyBuffer,
      })
      .rpc();
    console.log("Your transaction signature", tx);

    await sleep(5000);

    const confirmedTxn = await program.provider.connection.getParsedTransaction(
      tx,
      "confirmed"
    );

    console.log(JSON.stringify(confirmedTxn?.meta?.logMessages, undefined, 2));
  });
});
