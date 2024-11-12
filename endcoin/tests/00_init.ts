import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, Keypair, SendTransactionError } from "@solana/web3.js";
import { Endcoin } from "../target/types/endcoin";
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { assert, expect } from "chai";

import PAYER_KEY  from "./keys/wba-wallet.json";
import AMM_ID_KEY from "/Users/andrew/endcoin-wallet/amm_id.json";
import ADMIN_KEY from "/Users/andrew/endcoin-wallet/admin.json";
import ENDCOIN_KEY from "/Users/andrew/endcoin-wallet/endcoin.json";
import GAIACOIN_KEY from "/Users/andrew/endcoin-wallet/gaiacoin.json";
import MINTLP_KEY from "/Users/andrew/endcoin-wallet/mintLP.json";



const TOKEN_2022_PROGRAM_ID = new anchor.web3.PublicKey(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);


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

describe("Endcoin", () => {

  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Endcoin as Program<Endcoin>;

  const payer = Keypair.fromSecretKey(Uint8Array.from(PAYER_KEY));
  
  const amm_id = Keypair.fromSecretKey(Uint8Array.from(AMM_ID_KEY));

  const admin = Keypair.fromSecretKey(Uint8Array.from(ADMIN_KEY));
  
  const endcoin = Keypair.fromSecretKey(Uint8Array.from(ENDCOIN_KEY));
  
  const gaiacoin = Keypair.fromSecretKey(Uint8Array.from(GAIACOIN_KEY));
  
  const mintLiquidityPool = Keypair.fromSecretKey(Uint8Array.from(MINTLP_KEY));
  
  const [sst] = PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode("sea-surface-temperature"),
    ],
    program.programId
  );
  
  const [amm] = PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode("amm"),
    ],
    program.programId
  );

  const [pool] = PublicKey.findProgramAddressSync(
    [
      // amm.key().as_ref(),
      // endcoin.key().as_ref(),
      // gaiacoin.key().as_ref(),
      amm.toBuffer(),
      endcoin.publicKey.toBuffer(),
      gaiacoin.publicKey.toBuffer(),
    ],
    program.programId
  );
  const [poolAuthority] = PublicKey.findProgramAddressSync(
    [
      // seeds = [POOL_AUTHORITY_SEED]
      anchor.utils.bytes.utf8.encode("pool-authority"),
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
  console.log("payer: " + payer.publicKey);
  console.log("ProgramId: " + anchor.web3.SystemProgram.programId);
  console.log("Associated Program ID: " + ASSOCIATED_PROGRAM_ID);
  console.log("TOKEN 2022 PROGRAM ID: " + TOKEN_2022_PROGRAM_ID);

});


  it("Initialize SST", async () => {

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
      .createAmm(amm_id.publicKey, 65534)
      .accountsStrict({
      amm: amm,
      admin: admin.publicKey,
      payer: payer.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,

    })
      .signers([payer])
      .rpc();
  });


  it("Initialize ENDCOIN", async () => {

    await program.methods
      .createMints(false)
      .accountsStrict({
      endcoin: endcoin.publicKey,
      gaiacoin: gaiacoin.publicKey,
      extraMetasAccountEndcoin: extraMetasAccountEndcoin,
      extraMetasAccountGaiacoin: extraMetasAccountGaiacoin,
      authority: payer.publicKey,
      pool: pool,
      amm: amm,
      payer: payer.publicKey,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
      .signers([payer, endcoin, gaiacoin])
      .rpc();
  });

  it("Initialize GAIACOIN", async () => {

    await program.methods
      .createMints(true)
      .accountsStrict({
      endcoin: endcoin.publicKey,
      gaiacoin: gaiacoin.publicKey,
      extraMetasAccountEndcoin: extraMetasAccountEndcoin,
      extraMetasAccountGaiacoin: extraMetasAccountGaiacoin,
      authority: payer.publicKey,
      pool: pool,
      amm: amm,
      payer: payer.publicKey,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
      .signers([payer, endcoin, gaiacoin])
      .rpc();
  });

  it("Initialize Pool", async () => {

    await program.methods
      .createPool()
      .accountsStrict({
      amm: amm,
      pool: pool,
      poolAuthority: poolAuthority,
      mintLiquidityPool: mintLiquidityPool.publicKey,
      endcoin: endcoin.publicKey,
      gaiacoin: gaiacoin.publicKey,
      poolAccountA: associatedAddress({
        mint: endcoin.publicKey,
        owner: pool,
      }),
    poolAccountB: associatedAddress({
        mint: gaiacoin.publicKey,
        owner: pool,
      }),
      payer: payer.publicKey,
      tokenProgram: TOKEN_2022_PROGRAM_ID,
      associatedTokenProgram: ASSOCIATED_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
      authority: payer.publicKey,

    })
      .signers([payer, mintLiquidityPool])
      .rpc();
  });

  xit("mint extension constraints test passes", async () => {
    try {
      const tx = await program.methods
      .checkMintExtensionsConstraints()
      .accountsStrict({
        authority: payer.publicKey,
        mint: endcoin.publicKey,
      })
      .signers([payer])
      .rpc();
      assert.ok(tx, "transaction should be processed without error");
    } catch (e) {
      assert.fail('should not throw error');
    }
  });
  xit("mint extension constraints fails with invalid authority", async () => {
    const wrongAuth = Keypair.generate();
    try {
      const x = await program.methods
      .checkMintExtensionsConstraints()
      .accountsStrict({
        authority: wrongAuth.publicKey,
        mint: endcoin.publicKey,
      })
      .signers([payer, wrongAuth])
      .rpc();
      assert.fail('should have thrown an error');
    } catch (e) {
      expect(e, 'should throw error');
    }

  })
});






     