import {
    appendTransactionMessageInstruction,
    Commitment,
    CompilableTransactionMessage,
    TransactionMessageWithBlockhashLifetime,
    Rpc,
    RpcSubscriptions,
    SolanaRpcApi,
    SolanaRpcSubscriptionsApi,
    TransactionSigner,
    airdropFactory,
    createSolanaRpc,
    createSolanaRpcSubscriptions,
    createTransactionMessage,
    generateKeyPairSigner,
    getSignatureFromTransaction,
    lamports,
    pipe,
    sendAndConfirmTransactionFactory,
    setTransactionMessageFeePayerSigner,
    setTransactionMessageLifetimeUsingBlockhash,
    signTransactionMessageWithSigners,
    KeyPairSigner,
    address,
    createKeyPairFromPrivateKeyBytes,
    createAddressWithSeed,
    Address,
    createKeyPairSignerFromBytes,
    createKeyPairSignerFromPrivateKeyBytes,
    createKeyPairFromBytes
  } from '@solana/web3.js';

  import { assert } from 'chai';
  import wallet from "./keys/wba-wallet.json";
  import * as programClient from "../../clients/js/src/generated";
  import fs from 'fs';
  import bs58 from 'bs58';

// let key = new Uint8Array(JSON.parse(wallet));
let base58PrivateKey = bs58.encode(new Uint8Array(wallet));
console.log(base58PrivateKey);

  const progID = programClient.ENDCOIN_PROGRAM_ADDRESS;
  const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111"
  // generate keypair for amm
  // const ammKey = anchor.web3.Keypair.generate();
  type TestEnvironment = {
    rpcClient: RpcClient;
    authority: TransactionSigner;
    amm: Address;
    programClient: typeof programClient;
  };
  
  const createTestEnvironment = async (): Promise<TestEnvironment> => {
    const rpcClient = createDefaultSolanaClient();
    const authority = await createKeyPairSignerFromPrivateKeyBytes(Buffer.from(base58PrivateKey).slice(0, 32));

    const amm = await createAddressWithSeed({
        // The private key associated with this address will be able to sign for `derivedAddress`.
        baseAddress: programClient.ENDCOIN_PROGRAM_ADDRESS,
        programAddress: progID,
        seed: 'amm',
    });
    return { rpcClient, authority, amm, programClient};
  };
  
  type RpcClient = {
    rpc: Rpc<SolanaRpcApi>;
    rpcSubscriptions: RpcSubscriptions<SolanaRpcSubscriptionsApi>;
  };
  
  const createDefaultSolanaClient = (): RpcClient => {
    const rpc = createSolanaRpc('https://devnet.helius-rpc.com/?api-key=c99a21ad-12f7-4d4d-b889-1d055b434184');
    const rpcSubscriptions = createSolanaRpcSubscriptions('wss://devnet.helius-rpc.com/?api-key=c99a21ad-12f7-4d4d-b889-1d055b434184');
    return { rpc, rpcSubscriptions };
  };
  
//   const generateKeyPairSignerWithSol = async (
//     rpcClient: RpcClient,
//     // putativeLamports: bigint = 1_000_000_000n
//   ) => {
//     const signer = await generateKeyPairSigner();
//     // await airdropFactory(rpcClient)({
//     //   recipientAddress: signer.address,
//     //   lamports: lamports(putativeLamports),
//     //   commitment: 'confirmed',
//     // });
//     return signer;
//   };
  
  const createDefaultTransaction = async (
    testEnv: TestEnvironment
  ) => {
    const { rpcClient, authority: feePayer } = testEnv;
    const { value: latestBlockhash } = await rpcClient.rpc
      .getLatestBlockhash()
      .send();
    return pipe(
      createTransactionMessage({ version: 0 }),
      (tx) => setTransactionMessageFeePayerSigner(feePayer, tx),
      (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx)
    );
  };
  
  const signAndSendTransaction = async (
    rpcClient: RpcClient,
    transactionMessage: CompilableTransactionMessage &
      TransactionMessageWithBlockhashLifetime,
    commitment: Commitment = 'confirmed'
  ) => {
    try {
      const signedTransaction =
        await signTransactionMessageWithSigners(transactionMessage);
      const signature = getSignatureFromTransaction(signedTransaction);
      await sendAndConfirmTransactionFactory(rpcClient)(signedTransaction, {
        commitment,
      });
      return signature;
    } catch (error) {
      console.error(error);
    }
  };


// ############################################ //

describe('Endcoin tests', () => {
    let testEnv: TestEnvironment;
    console.log(base58PrivateKey);
    before(async () => {
      testEnv = await createTestEnvironment();
    })
  
    it("Create AMM!", async () => {
        console.log(base58PrivateKey);

        console.log("progID: ", progID);
        console.log("amm: ", testEnv.amm);
        console.log("authority: ", testEnv.authority);
        console.log("myWallet: ", testEnv.authority);
        console.log("systemProgram: ", SYSTEM_PROGRAM_ID);        
        console.log("id: ", programClient.ENDCOIN_PROGRAM_ADDRESS);

      const createIx = testEnv.programClient.getCreateAmmInstruction({
          amm: testEnv.amm, // not this one
          admin: testEnv.authority.address,
          payer: testEnv.authority,
          systemProgram: address(SYSTEM_PROGRAM_ID), // not this one
          id: programClient.ENDCOIN_PROGRAM_ADDRESS, // not this one
          fee: 500
      });
      await pipe(
        await createDefaultTransaction(testEnv),
        (tx) => appendTransactionMessageInstruction(createIx, tx),
        (tx) => signAndSendTransaction(testEnv.rpcClient, tx)
      );
    //   let ammAccount = await testEnv.programClient.fetchAmm(testEnv.rpcClient.rpc, testEnv.amm);
    //   assert.strictEqual(ammAccount.data.admin, testEnv.authority.address);
    //   assert.strictEqual(ammAccount.data.created, true);
    });

    xit("Create AMM!", async () => {
        console.log(base58PrivateKey);

        console.log("progID: ", progID);
        console.log("amm: ", testEnv.amm);
        console.log("authority: ", testEnv.authority);
        console.log("myWallet: ", testEnv.authority);
        console.log("systemProgram: ", SYSTEM_PROGRAM_ID);        
        console.log("id: ", programClient.ENDCOIN_PROGRAM_ADDRESS);

      const createIx = testEnv.programClient.getCreateMintAccountInstruction(
        {
            amm: testEnv.amm,
            payer: testEnv.authority,
            systemProgram: address(SYSTEM_PROGRAM_ID),
            authority: undefined,
            receiver: undefined,
            pool: undefined,
            mintA: undefined,
            mintB: undefined,
            mintTokenAccountA: undefined,
            mintTokenAccountB: undefined,
            extraMetasAccountA: undefined,
            extraMetasAccountB: undefined,
            token: false
        }
    );
      await pipe(
        await createDefaultTransaction(testEnv),
        (tx) => appendTransactionMessageInstruction(createIx, tx),
        (tx) => signAndSendTransaction(testEnv.rpcClient, tx)
      );
    //   let ammAccount = await testEnv.programClient.fetchAmm(testEnv.rpcClient.rpc, testEnv.amm);
    //   assert.strictEqual(ammAccount.data.admin, testEnv.authority.address);
    //   assert.strictEqual(ammAccount.data.created, true);
    });








  });


