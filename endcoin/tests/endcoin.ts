import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { Endcoin } from "../target/types/endcoin";
import {randomBytes} from "crypto";
import { Keypair, PublicKey, SystemProgram} from "@solana/web3.js";


describe("endcoin", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  const provider = anchor.getProvider();
  const confirm = async (signature: string): Promise<string> => {
    const block = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      signature,
      ...block
    })
    return signature
  }

  const log = async(signature: string) => {
    console.log(`Your transaction signature: https://explorer.solana.com/transaction/${signature}?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899`);
    return signature;
  }

  const program = anchor.workspace.Endcoin as Program<Endcoin>;
  const seed = new BN(randomBytes(8));

  const endcoin_mint = Keypair.generate();
  const gaiacoin_mint = Keypair.generate();
  const endcoin_metadata = Keypair.generate();
  const gaiacoin_metadata = Keypair.generate();
  const auth = Keypair.generate();
  const metadataProgram = new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");
  const state = PublicKey.findProgramAddressSync( [
    Buffer.from("state"),
    seed.toBuffer('le', 8)
    ],
    program.programId)[0];




  it("Is initialized!", async () => {

    // Add your test here.
    const tx = await program.methods.init().accounts(
      {
        auth: auth.publicKey,
        endcoinMint: endcoin_mint.publicKey,
        gaiacoinMint: gaiacoin_mint.publicKey,
        endcoinMetadata: endcoin_metadata.publicKey,
        gaiacoinMetadata: gaiacoin_metadata.publicKey,
        rent: SystemProgram.programId,
        state,
       metadataProgram,
      }
    ).signers([auth]).rpc().then(confirm).then(log);
    console.log("Your transaction signature", tx);
  });

});
