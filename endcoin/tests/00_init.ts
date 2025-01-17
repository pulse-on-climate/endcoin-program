import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Endcoin } from "../target/types/endcoin";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { assert, expect } from "chai";

import PAYER_KEY  from "./keys/wba-wallet.json";
import AMM_ID_KEY from "/Users/andrew/endcoin-wallet/amm_id.json";
import ADMIN_KEY from "/Users/andrew/endcoin-wallet/admin.json";
import ENDCOIN_KEY from "/Users/andrew/endcoin-wallet/endcoin.json";
import GAIACOIN_KEY from "/Users/andrew/endcoin-wallet/gaiacoin.json";
import MINTLP_KEY from "/Users/andrew/endcoin-wallet/mintLP.json";

import {
  closeAccount,
  createInitializeMintInstruction,
  createInitializeMintCloseAuthorityInstruction,
  getMintLen,
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  mintTo,
  getOrCreateAssociatedTokenAccount,
  createAssociatedTokenAccountIdempotent,
} from '@solana/spl-token';
import {
  PublicKey, 
  clusterApiUrl,
  sendAndConfirmTransaction,
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

// const TOKEN_2022_PROGRAM_ID = new anchor.web3.PublicKey(
//   "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
// );


// associated token addresses
export function associatedAddress({
  mint,
  owner,
}: {
  mint: PublicKey;
  owner: PublicKey;
}): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_2022_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_PROGRAM_ID
  )[0];
}

const connection = new Connection(clusterApiUrl('devnet'),
  {
    commitment: "confirmed"
  });


  // create a token 2022 mint
  async function createMint(payer: anchor.web3.Keypair, mint: anchor.web3.Keypair, program): Promise<anchor.web3.Keypair> {
    

    const [mintAuthority] = PublicKey.findProgramAddressSync(
      [
        anchor.utils.bytes.utf8.encode("authority"),
      ],
      program.programId
    );

    const freezeAuthority = Keypair.generate();
    const closeAuthority = Keypair.generate();

    const extensions = [ExtensionType.MintCloseAuthority];
    const mintLen = getMintLen(extensions);
    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMintCloseAuthorityInstruction(mint.publicKey, closeAuthority.publicKey, TOKEN_2022_PROGRAM_ID),
      createInitializeMintInstruction(
        mint.publicKey,
        6,
        mintAuthority,
        freezeAuthority.publicKey,
        TOKEN_2022_PROGRAM_ID
      )
    );
    await sendAndConfirmTransaction(connection, transaction, [payer, mint], undefined);

    return mint;
  }


  const payer = Keypair.fromSecretKey(Uint8Array.from(PAYER_KEY));

  // Usage
  let endcoin = Keypair.generate();
  let gaiacoin = Keypair.generate();

describe("Endcoin", () => {

  it("airdrop payer", async () => {
    const tx = await provider.connection.requestAirdrop(payer.publicKey, 10000000000);

      await new Promise(resolve => setTimeout(resolve, 1000));
      let confirm = await provider.connection.getSignatureStatuses([tx]);

      if (confirm.value[0].err) {
        throw new Error(confirm.value[0].err.toString());
      }
      if (confirm.value[0].confirmationStatus === 'confirmed') {
        console.log('payer airdropped');
      }
  });
  
  it("Create endcoin", async () => {

          endcoin = await createMint(payer, endcoin, program);
          console.log("Endcoin mint created:", endcoin.publicKey.toBase58());
  
  });

  it("Create gaiacoin mint", async () => {

    gaiacoin = await createMint(payer, gaiacoin, program);
    console.log("Gaiacoin mint created:", gaiacoin.publicKey.toBase58());
  
  });



  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Endcoin as Program<Endcoin>;
  
  const amm_id = Keypair.generate();

  const admin = Keypair.fromSecretKey(Uint8Array.from(ADMIN_KEY));
  
  // const endcoin = Keypair.fromSecretKey(Uint8Array.from(ENDCOIN_KEY));
  
  // const gaiacoin = Keypair.fromSecretKey(Uint8Array.from(GAIACOIN_KEY));
  
  // const endcoin = new PublicKey("9kY89Y73KueHwfVq3hAVHsJyVpstDPCjRa7eaUpmijYq");
  
  // const gaiacoin = new PublicKey("7j2kHSxEhvvHjNVjNcrp8epS6sZ1UdcDpRrDrWt2YZbq");
  
  //const mintLiquidityPool = Keypair.fromSecretKey(Uint8Array.from(MINTLP_KEY));
  
  const mintLiquidityPool = Keypair.generate();

  const [sst] = PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode("sea-surface-temperature"),
      payer.publicKey.toBuffer(),
    ],
    program.programId
  );
  
  const [amm] = PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode("amm"),
      amm_id.publicKey.toBuffer(),
    ],
    program.programId
  );

  const [pool] = PublicKey.findProgramAddressSync(
    [
      amm.toBuffer(),
      endcoin.publicKey.toBuffer(),
      gaiacoin.publicKey.toBuffer(),
    ],
    program.programId
  );

  const [rewardVault, _] = PublicKey.findProgramAddressSync(
    [
      pool.toBuffer(),
      endcoin.publicKey.toBuffer(),
      gaiacoin.publicKey.toBuffer(),
      anchor.utils.bytes.utf8.encode("reward-vault"),
    ],
    program.programId
  );

  const [poolAuthority] = PublicKey.findProgramAddressSync(
    [
      amm.toBuffer(),
      endcoin.publicKey.toBuffer(),
      gaiacoin.publicKey.toBuffer(),
      anchor.utils.bytes.utf8.encode("pool-authority"),
    ],
    program.programId
  );



  const [authority] = PublicKey.findProgramAddressSync(
    [
      // seeds = [AUTHORITY_SEED]
      anchor.utils.bytes.utf8.encode("authority"),
    ],
    program.programId
  );
  
const [extraMetasAccountEndcoin] = PublicKey.findProgramAddressSync(
[
  // seeds = [META_LIST_ACCOUNT_SEED, endcoin.key().as_ref()],
  anchor.utils.bytes.utf8.encode("extra-account-metas"),
  endcoin.publicKey.toBuffer(),
],
program.programId
);

const [extraMetasAccountGaiacoin] = PublicKey.findProgramAddressSync(
[
  // seeds = [META_LIST_ACCOUNT_SEED, gaiacoin.key().as_ref()],
  anchor.utils.bytes.utf8.encode("extra-account-metas"),
  gaiacoin.publicKey.toBuffer(),
],
program.programId
);

const [programData] = PublicKey.findProgramAddressSync(
  [program.programId.toBuffer()],
  new PublicKey('BPFLoaderUpgradeab1e1111111111111111111111111')
);



  it("Check values", async () => {
    console.log("sst: " + sst);
    console.log("amm: " + amm);
    console.log("admin: " + admin.publicKey);
    console.log("endcoin mint: " + endcoin.publicKey);
    console.log("gaiacoin mint: " + gaiacoin.publicKey);
    console.log("Extras Metas Endcoin: " + extraMetasAccountEndcoin);
    console.log("Extras Metas Gaiacoin: " + extraMetasAccountGaiacoin);
    console.log("payer: " + payer.publicKey);
    console.log("Pool: " + pool);
    console.log("endcoin ata: " + 
      associatedAddress({
          mint: endcoin.publicKey,
          owner: pool,
        })
      );
      console.log("gaiacoin ata: " + associatedAddress({
          mint: gaiacoin.publicKey,
          owner: pool,
        })
      );
    console.log("MintLiquidityPool: " + mintLiquidityPool.publicKey);
    console.log("PoolAuth: " + poolAuthority);
    console.log("Auth: " + authority);
    console.log("payer: " + payer.publicKey);
    console.log("ProgramId: " + anchor.web3.SystemProgram.programId);
    console.log("Associated Program ID: " + ASSOCIATED_PROGRAM_ID);
    console.log("TOKEN 2022 PROGRAM ID: " + TOKEN_2022_PROGRAM_ID);

  });

  xit("Initialize SST", async () => {

    await program.methods
      .createSst()
      .accountsStrict({
      sst: sst,
      payer: payer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
      .signers([payer])
      .rpc();
  });

  it("Initialize AMM", async () => {

    await program.methods
      .createAmm(amm_id.publicKey, 500)
      .accountsStrict({
        amm: amm,
        admin: admin.publicKey,
        program: program.programId,
        programData: programData,  // You'll need to derive this
        authority: payer.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      
    })
      .signers([payer, admin])
      .rpc();
  });

  it("Initialize Pool", async () => {

    await program.methods
      .createPool()
      .accountsStrict({
      amm: amm,
      pool: pool,
      poolAuthority: poolAuthority,
      mintLiquidity: mintLiquidityPool.publicKey,
      mintA: endcoin.publicKey,
      mintB: gaiacoin.publicKey,
      payer: payer.publicKey,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
      .signers([mintLiquidityPool, payer])
      .rpc();
  });


  it("Initialize Pool Mint A and B Token accounts", async () => {

    await program.methods
      .createTokenAccounts()
      .accountsStrict({
        poolAccountA: associatedAddress({
          mint: endcoin.publicKey,
          owner: poolAuthority,
        }),
        poolAccountB: associatedAddress({
          mint: gaiacoin.publicKey,
          owner: poolAuthority,
        }),
      amm: amm,
      poolAuthority: poolAuthority,
      mintA: endcoin.publicKey,
      mintB: gaiacoin.publicKey,
      payer: payer.publicKey,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
      .signers([payer])
      .rpc();
  });

  it("Create Reward Vault", async () => {

    const [rewardAuthority] = await PublicKey.findProgramAddressSync(
      [
        pool.toBuffer(),
        endcoin.publicKey.toBuffer(),
        gaiacoin.publicKey.toBuffer(),
        anchor.utils.bytes.utf8.encode("reward-authority"),
      ],
      program.programId
    );


    await program.methods
      .createRewardVault()
      .accountsStrict({
        rewardVault: rewardVault,
        pool: pool,
        mintA: endcoin.publicKey,
        mintB: gaiacoin.publicKey,
        payer: payer.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc();
  });


  it("Create Reward Token Accounts", async () => {

    await program.methods
      .createRewardTokenAccounts()
      .accountsStrict({
        pool: pool,
        rewardVault: rewardVault,
        mintA: endcoin.publicKey,
        mintB: gaiacoin.publicKey,
        payer: payer.publicKey,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        rewardAccountA: associatedAddress({
          mint: endcoin.publicKey,
          owner: rewardVault,
        }),
        rewardAccountB: associatedAddress({
          mint: gaiacoin.publicKey,
          owner: rewardVault,
        }),
      })
      .signers([payer])
      .rpc();
  });

  it("Update AMM", async () => {
    try {

    // Fetch the AMM account data before the transaction
    let ammAccountBefore = await program.account.amm.fetch(amm);
    console.log("AMM Admin before update:", ammAccountBefore.admin.toBase58());


      await program.methods
        .updateAdmin(payer.publicKey)
        .accountsStrict({
          amm: amm,
          admin: admin.publicKey
        })
        .signers([admin])
        .rpc();
      console.log("Update AMM transaction successful");

      // Fetch the AMM account data after the transaction
    let ammAccountAfter = await program.account.amm.fetch(amm);
    console.log("AMM Admin after update:", ammAccountAfter.admin.toBase58());

    // Assert that the admin has been updated
    assert.equal(ammAccountAfter.admin.toBase58(), payer.publicKey.toBase58(), "Admin should be updated to the new admin");
    } catch (err) {
      console.error("Error updating AMM:", err);
    }
  });

  it("Update AMM Fee", async () => {
    try {
    let new_fee = 11000;
    // Fetch the AMM account data before the transaction
    let ammFeeBefore = await program.account.amm.fetch(amm);
    console.log("AMM Fee before update:", ammFeeBefore.fee);


      await program.methods
        .updateFee(new_fee)
        .accountsStrict({
          amm: amm,
          admin: admin.publicKey
        })
        .signers([admin])
        .rpc();
      console.log("Update AMM fee transaction successful");

      // Fetch the AMM account data after the transaction
    let ammFeeAfter = await program.account.amm.fetch(amm);
    console.log("AMM Admin after update:", ammFeeAfter.fee);

    // Assert that the admin has been updated
    assert.equal(ammFeeAfter.fee, new_fee, "Fee should be updated to the new Fee");
    } catch (err) {
      console.error("Error updating Fee:", err);
    }
  });


  // it("Send Endcoin and gaiacoin to payer wallet for tests", async () => {

  //   const [mintAuthority, mintAuthorityBump] = PublicKey.findProgramAddressSync(
  //     [anchor.utils.bytes.utf8.encode("authority")],
  //     program.programId
  //   );

  //   const mintAuthoritySeeds = [
  //     anchor.utils.bytes.utf8.encode("authority"),
  //     new Uint8Array([mintAuthorityBump])
  //   ];

  //   // let tokenAccountEndcoin = await getOrCreateAssociatedTokenAccount(
  //   //   connection,
  //   //   payer,
  //   //   endcoin.publicKey,
  //   //   payer.publicKey
  //   // );

  //   let tokenAccountEndcoin = await createAssociatedTokenAccountIdempotent(provider.connection, 
  //     payer, 
  //     endcoin.publicKey, 
  //     payer.publicKey, 
  //     {}, 
  //     TOKEN_2022_PROGRAM_ID
  //   );
  
  //   let tokenAccountGaiacoin = await createAssociatedTokenAccountIdempotent(provider.connection, 
  //     payer, 
  //     gaiacoin.publicKey, 
  //     payer.publicKey, 
  //     {}, 
  //     TOKEN_2022_PROGRAM_ID
  //   );
  
  //   console.log("Endcoin ATA: " + tokenAccountEndcoin);
  //   console.log("Gaiacoin ATA: " + tokenAccountGaiacoin);
  
  //   await mintTo(
  //     connection,
  //     payer,
  //     endcoin.publicKey,
  //     tokenAccountEndcoin,
  //     mintAuthority,
  //     100,
  //     [payer],
  //     mintAuthoritySeeds
  //   );
  
  //   await mintTo(
  //     connection,
  //     payer,
  //     gaiacoin.publicKey,
  //     tokenAccountGaiacoin,
  //     mintAuthority,
  //     100,
  //     [Keypair.fromSeed(mintAuthoritySeeds[0])]
  //   );


  // });


  xit("Pull Feed", async () => {


    let feed = "GhCs7zhha7kTyt8EiaWaBT5DREt23GnoPnqa7AU4yv1y";


    const tx = await program.methods
      .pullFeed()
      .accountsStrict({
        feed,
  }).rpc();

  const latestBlockHash = await provider.connection.getLatestBlockhash();
  await provider.connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: tx,
    },
    "confirmed"
  );

  const txDetails = await program.provider.connection.getTransaction(tx, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });

  const logs = txDetails?.meta?.logMessages || null;

  if (!logs) {
    console.log("No logs found");
  } else {
    console.log("Logs:", logs);
  }
  });

  it("Deposit Liquidity", async () => {
    let latestValue = 21.00;

    const tx = await program.methods
      .depositLiquidity(latestValue)
      .accountsStrict({
        pool: pool,
        poolAuthority: poolAuthority,
        payer: payer.publicKey,
        mintLiquidity: mintLiquidityPool.publicKey,
        mintA: endcoin.publicKey,
        mintB: gaiacoin.publicKey,
        mintAuthority: authority,
        poolAccountA: associatedAddress({
          mint: endcoin.publicKey,
          owner: poolAuthority,
        }),
        poolAccountB: associatedAddress({
          mint: gaiacoin.publicKey,
          owner: poolAuthority,
        }),
        depositorAccountLiquidity: associatedAddress({
          mint: mintLiquidityPool.publicKey,
          owner: poolAuthority,
        }),
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
  }).rpc();

  const latestBlockHash = await provider.connection.getLatestBlockhash();
  await provider.connection.confirmTransaction(
    {
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: tx,
    },
    "confirmed"
  );

  const txDetails = await program.provider.connection.getTransaction(tx, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });

  const logs = txDetails?.meta?.logMessages || null;

  if (!logs) {
    console.log("No logs found");
  } else {
    console.log("Logs:", logs);
  }
  });

  it("Deposit Rewards", async () => {

    let meanTemp = 21.00;

    await program.methods
      .depositRewards(meanTemp)
      .accountsStrict({
        rewardVault: rewardVault,
        pool: pool,
        payer: payer.publicKey,
        mintA: endcoin.publicKey,
        mintB: gaiacoin.publicKey,
        mintAuthority: authority,
        rewardAccountA: associatedAddress({
          mint: endcoin.publicKey,
          owner: rewardVault,
        }),
        rewardAccountB: associatedAddress({
          mint: gaiacoin.publicKey,
          owner: rewardVault,
        }),
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([payer])
      .rpc();

  });

  it("Claim Rewards", async () => {

    console.log("\nDebug addresses:");
    console.log("Pool:", pool.toBase58());
    console.log("Reward Authority:", rewardVault.toBase58());
    console.log("Endcoin Mint:", endcoin.publicKey.toBase58());
    console.log("Gaiacoin Mint:", gaiacoin.publicKey.toBase58());

    let amountA = new anchor.BN(10 * 10 ** 6);
    let amountB = new anchor.BN(5 * 10 ** 6);

    await program.methods
    .claimReward(payer.publicKey, amountA, amountB)
    .accountsStrict({
      pool: pool,
      claimer: payer.publicKey,
      mintA: endcoin.publicKey,
      mintB: gaiacoin.publicKey,
      rewardVault: rewardVault,
      rewardAccountA: associatedAddress({
        mint: endcoin.publicKey,
        owner: rewardVault,
      }),
      rewardAccountB: associatedAddress({
        mint: gaiacoin.publicKey,
        owner: rewardVault,
      }),
      toMintAAccount: associatedAddress({ 
        mint: endcoin.publicKey, 
        owner: payer.publicKey 
      }),
      toMintBAccount: associatedAddress({ 
        mint: gaiacoin.publicKey, 
        owner: payer.publicKey 
      }),
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([payer])
    .rpc();

  });

  it("Swap from A to B", async () => {
    const input = new anchor.BN(10 ** 6);
    
    try {
      const tx = await program.methods
        .swapExactTokensForTokens(true, input)
        .accountsStrict({
          amm: amm,
          poolAuthority: poolAuthority,
          trader: payer.publicKey, 
          payer: payer.publicKey,
          mintA: endcoin.publicKey,
          mintB: gaiacoin.publicKey,
          poolAccountA: associatedAddress({
            mint: endcoin.publicKey,
            owner: poolAuthority,
          }),
          poolAccountB: associatedAddress({
            mint: gaiacoin.publicKey,
            owner: poolAuthority,
          }),
          traderAccountA: associatedAddress({
          mint: endcoin.publicKey,
          owner: payer.publicKey,
        }),
          traderAccountB: associatedAddress({
            mint: gaiacoin.publicKey,
            owner: payer.publicKey,
          }),
          tokenProgram: TOKEN_2022_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([payer])
        .rpc({ skipPreflight: true });

      // Get and print the logs immediately
      const txDetails = await provider.connection.getTransaction(tx, {
        maxSupportedTransactionVersion: 0,
        commitment: "confirmed"
      });
      
      if (txDetails?.meta?.logMessages) {
        console.log("Program Logs:");
        txDetails.meta.logMessages.forEach(log => console.log(log));
      }

    } catch (error) {
      if ('logs' in error) {
        console.log("Error logs:", error.logs);
      }
      console.error("Full error:", error);
      throw error;
    }
  });



});






     