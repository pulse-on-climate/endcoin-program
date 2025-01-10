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



  // create a token 2022 mint
  async function createMint(payer: anchor.web3.Keypair, mint: anchor.web3.Keypair): Promise<anchor.web3.Keypair> {

    const mintAuthority = Keypair.generate();
    const freezeAuthority = Keypair.generate();
    const closeAuthority = Keypair.generate();

    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

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
        mintAuthority.publicKey,
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
  
  it("Create endcoin", async () => {

          endcoin = await createMint(payer, endcoin);
          console.log("Endcoin mint created:", endcoin.publicKey.toBase58());
  
  });
  it("Create gaiacoin mint", async () => {

    gaiacoin = await createMint(payer, gaiacoin);
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
  new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
);



  xit("airdrop payer", async () => {
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
  let latestValue = 20.7;

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
      sst: sst,
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
        owner: authority,
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


});






     