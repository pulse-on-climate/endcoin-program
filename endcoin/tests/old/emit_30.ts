import * as anchor from "@coral-xyz/anchor";
import Big from "big.js";
import { IDL, Endcoin } from "./target/types/endcoin";
import { 
  PublicKey, 
  Keypair,
  Commitment,
  Connection, 
} from "@solana/web3.js";
import {
  AggregatorAccount,
  SwitchboardProgram,
} from "@switchboard-xyz/solana.js";

import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import wallet_key from "./tests/keys/wba-wallet.json"
import endcoin_key from "./tests/keys/ENDxPmLfBBTVby7DBYUo4gEkFABQgvLP2LydFCzGGBee.json"
import gaiacoin_key from "./tests/keys/GAiAxUPQrUaELAuri8tVC354bGuUGGykCN8tP4qfCeSp.json"
import pulse_key from "./tests/keys/PLSxiYHus8rhc2NhXs2qvvhAcpsa4Q3TzTCi3o8xAEU.json"
import the_keypair from "./tests/keys/keyvSSnFs5p6ya3wGkx1VkJdhP1Xa8VxBhVLg1d1FUK.json"
import { TIMEOUT } from "dns";
import { set } from "@project-serum/anchor/dist/cjs/utils/features";

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

  // Configure the client to use the devnet cluster.
  const keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(wallet_key)); // replace with wallet
  
  const commitment: Commitment = "confirmed"; // processed, confirmed, finalized
  const connection = new Connection("https://api.devnet.solana.com");
  const provider = new anchor.AnchorProvider(connection, new anchor.Wallet(keypair), { commitment });

  const programId = new PublicKey("3ueQV5DMwmnif9JBmf7SSvD6Lsf13nBu4dzCQfsjZX3d");

  const program = new anchor.Program<Endcoin>(IDL, programId, provider);
  
  // KEYS //
  let mintA = anchor.web3.Keypair.fromSecretKey(new Uint8Array(endcoin_key)); // replace with endcoin file
  let mintB = anchor.web3.Keypair.fromSecretKey(new Uint8Array(gaiacoin_key)); // replace with gaiacoin file
  let mintLp = anchor.web3.Keypair.fromSecretKey(new Uint8Array(pulse_key)); // replace with pulse file
 
  let mintAuthority = PublicKey.findProgramAddressSync([Buffer.from("auth")], program.programId)[0];
  let amm = PublicKey.findProgramAddressSync([Buffer.from("amm")], program.programId)[0];

  let fee = 500;
  // SST // 
  const sst = PublicKey.findProgramAddressSync(
    [
      Buffer.from("seaSurfaceTemperature"),
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


  it("Generate Tokens", async () => {

      // let SwitchboardPrograms = await SwitchboardProgram.load(
      //   new Connection("https://api.devnet.solana.com")
      // );
    
      // const aggregatorAccount = new AggregatorAccount(SwitchboardPrograms, AGGREGATOR_PUBKEY);
    
      // const result: Big | null = await aggregatorAccount.fetchLatestValue();
      // if (result === null) {
      //   throw new Error("Aggregator holds no value");
      // }
      // console.log(result.toString());
      // latestValue = result;

const temperature_json = [20.94,20.96,20.98,21.00,21.02,21.03,21.03,21.04,21.04,21.05,21.06,21.06,21.05,21.04,21.03,21.01,21.00,21.01,21.04,21.06,21.04,21.03,21.02,21.01,21.01,20.99,21.00,21.02,21.03]

temperature_json.forEach(async temp => {
 
  program.methods
    .depositLiquidity(temp)
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
    .signers([keypair]).rpc({ skipPreflight: true }).then(confirm).then(log)
    setTimeout(null, 1000);;

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
       
})

});
});