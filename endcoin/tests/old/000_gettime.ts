import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
    Keypair,
    PublicKey
  } from "@solana/web3.js";
import { Endcoin } from "./target/types/endcoin";


// import my keypair
import PAYER_KEY  from "./tests/keys/wba-wallet.json";



const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);

const program = anchor.workspace.Endcoin as Program<Endcoin>;

// Airdropping 1 SOL
    const payer = Keypair.fromSecretKey(Uint8Array.from(PAYER_KEY));

   
    // const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

    // Hello state account
    const [timeAccount] = PublicKey.findProgramAddressSync(
        [
          // seeds = [AUTHORITY_SEED]
          anchor.utils.bytes.utf8.encode("time"),
        ],
        program.programId
      );
   
      const getTimestamp = async () => {

    
        const tx = await program.methods
          .updateTimestamp()
          .accountsStrict({
            time: timeAccount,
            payer: payer.publicKey,
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
      // get the transaction details

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

      // console log the transaction details
      console.log("Transaction Details:", txDetails);



    }

    getTimestamp();