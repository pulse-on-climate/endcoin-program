import * as anchor from "@coral-xyz/anchor";
import { IDL, Endcoin } from "./target/types/endcoin";
import { 
    PublicKey, 
    Keypair,
    Commitment,
    Connection, 
  } from "@solana/web3.js";
import { expect } from "chai";
// import { TestValues, createValues, mintingTokens } from "./utils";
import { BN } from "bn.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import wallet_key from "./tests/keys/wba-wallet.json"
import endcoin_key from "./tests/keys/ENDxPmLfBBTVby7DBYUo4gEkFABQgvLP2LydFCzGGBee.json"
import gaiacoin_key from "./tests/keys/GAiAxUPQrUaELAuri8tVC354bGuUGGykCN8tP4qfCeSp.json"
import pulse_key from "./tests/keys/PLSxiYHus8rhc2NhXs2qvvhAcpsa4Q3TzTCi3o8xAEU.json"
  // Configure the client to use the devnet cluster.
  
  describe("Swap", () => {
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  anchor.setProvider(provider);

  const programId = new PublicKey("3ueQV5DMwmnif9JBmf7SSvD6Lsf13nBu4dzCQfsjZX3d");
  const program = new anchor.Program<Endcoin>(IDL, programId, provider);

  const keypair = anchor.web3.Keypair.fromSecretKey(new Uint8Array(wallet_key)); // replace with wallet
  
  // KEYS //
  let mintA = anchor.web3.Keypair.fromSecretKey(new Uint8Array(endcoin_key)); // replace with endcoin file
  let mintB = anchor.web3.Keypair.fromSecretKey(new Uint8Array(gaiacoin_key)); // replace with gaiacoin file
  let mintLp = anchor.web3.Keypair.fromSecretKey(new Uint8Array(pulse_key)); // replace with pulse file

  let mintAuthority = PublicKey.findProgramAddressSync([Buffer.from("auth")], program.programId)[0];

  let holderAccountA = getAssociatedTokenAddressSync(
    mintA.publicKey,
    mintAuthority,
    true
  );
  let holderAccountB = getAssociatedTokenAddressSync(
    mintB.publicKey,
    mintAuthority,
    true
  );


  let amm = PublicKey.findProgramAddressSync([Buffer.from("amm")], program.programId)[0];

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


  it("Swap from A to B", async () => {
    const depositAmountA = new BN(4 * 10 ** 6);
    const depositAmountB = new BN(1 * 10 ** 6);
    const minimumLiquidity = new BN(100);
    const defaultSupply = new BN(100 * 10 ** 6);
    const input = new BN(10 ** 6);
    
    await program.methods
      .swapExactTokensForTokens(true, input, new BN(100))
      .accounts({
        amm: amm,
        pool: poolKey,
        poolAuthority: poolAuthority,
        trader: keypair.publicKey,
        mintA: mintA.publicKey,
        mintB: mintB.publicKey,
        poolAccountA: poolAccountA,
        poolAccountB: poolAccountB,
        traderAccountA: holderAccountA,
        traderAccountB: holderAccountB,
        payer: keypair.publicKey,
      })
      .signers([keypair])
      .rpc({ skipPreflight: true });

    const traderTokenAccountA = await connection.getTokenAccountBalance(
      holderAccountA
    );
    const traderTokenAccountB = await connection.getTokenAccountBalance(
      holderAccountB
    );
    expect(traderTokenAccountA.value.amount).to.equal(
      defaultSupply.sub(depositAmountA).sub(input).toString()
    );
    expect(Number(traderTokenAccountB.value.amount)).to.be.greaterThan(
      defaultSupply.sub(depositAmountB).toNumber()
    );
    expect(Number(traderTokenAccountB.value.amount)).to.be.lessThan(
      defaultSupply.sub(depositAmountB).add(input).toNumber()
    );
  });
});