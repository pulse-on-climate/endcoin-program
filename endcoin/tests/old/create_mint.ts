import {
    clusterApiUrl,
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction,
  } from '@solana/web3.js';
  import {
    createInitializeMetadataPointerInstruction,
    createInitializeMintInstruction,
    ExtensionType,
    getMintLen,
    LENGTH_SIZE,
    TOKEN_2022_PROGRAM_ID,
    TYPE_SIZE,
  } from '@solana/spl-token';
  import { createInitializeInstruction, pack, TokenMetadata } from '@solana/spl-token-metadata';
  
  import PAYER_KEY  from "./keys/wba-wallet.json";

  (async () => {
    const payer = Keypair.fromSecretKey(Uint8Array.from(PAYER_KEY));
  
    const mint = Keypair.generate();
    const decimals = 9;
  
    const metadata: TokenMetadata = {
      mint: mint.publicKey,
      name: 'TOKEN_NAME',
      symbol: 'SMBL',
      uri: 'URI',
      additionalMetadata: [['new-field', 'new-value']],
    };
  
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
  
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;
  
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
  
    // const airdropSignature = await connection.requestAirdrop(payer.publicKey, 2 * LAMPORTS_PER_SOL);
    // await connection.confirmTransaction({
    //   signature: airdropSignature,
    //   ...(await connection.getLatestBlockhash()),
    // });
  
    const mintLamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
    const mintTransaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: payer.publicKey,
        newAccountPubkey: mint.publicKey,
        space: mintLen,
        lamports: mintLamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(mint.publicKey, payer.publicKey, mint.publicKey, TOKEN_2022_PROGRAM_ID),
      createInitializeMintInstruction(mint.publicKey, decimals, payer.publicKey, null, TOKEN_2022_PROGRAM_ID),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mint.publicKey,
        metadata: mint.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: payer.publicKey,
        updateAuthority: payer.publicKey,
      }),
    );
    const result = await sendAndConfirmTransaction(connection, mintTransaction, [payer, mint]);
    console.log("Transaction result:", result);
  })();