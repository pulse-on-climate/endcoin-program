// Anchor Imports
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Endcoin } from "../target/types/endcoin";

// Solana Imports
import { Keypair, Connection, Commitment } from "@solana/web3.js";
import { createMint } from '@solana/spl-token';

// Wallet Import
import wallet from "../../endcoin/wba-wallet.json";

// Metaplex Imports
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { 
    createMetadataAccountV3, 
    CreateMetadataAccountV3InstructionAccounts, 
    CreateMetadataAccountV3InstructionArgs,
    DataV2Args
} from "@metaplex-foundation/mpl-token-metadata";
import { createSignerFromKeypair, signerIdentity, publicKey } from "@metaplex-foundation/umi";


// get our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);
const umi = createUmi('https://api.devnet.solana.com');
const umikeypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, umikeypair);
umi.use(signerIdentity(createSignerFromKeypair(umi, umikeypair)));

///////////
// TESTS
///////////

describe("endcoin", () => {

  // Configure the client to use the local cluster.

  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Endcoin as Program<Endcoin>;
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

 let mint;

  it("Is initialized!", async () => {

    try {

      mint = await createMint(connection, keypair, keypair.publicKey, null, 6);
      console.log(`made mint`, mint.toBase58());



      let accounts: CreateMetadataAccountV3InstructionAccounts = {
        metadata: publicKey(umikeypair),
        mint: publicKey(mint),
        mintAuthority: signer,
    }

    let data: DataV2Args = {
        name: "imetandyCoin",
        symbol: "IMAC",
        uri:"https://www.imetandy.com",
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null  
    }

    let args: CreateMetadataAccountV3InstructionArgs = {
        data: data,
        isMutable: true,
        collectionDetails: null
    }

    let tx = createMetadataAccountV3(
        umi,
        {
            ...accounts,
            ...args
        }
    )

    let result = await tx.sendAndConfirm(umi).then(r => r.signature.toString()).then(confirm).then(log);

    } catch(error) {
        console.log(`Oops, something went wrong with mint: ${error}`)

    }

    //const tx = await program.methods.init().rpc();
    console.log("Your transaction signature");
  });


it("Append Metadata", async () => {

  try {

    console.log(publicKey(mint));
} catch(e) {
    console.error(`Oops, something went wrong with metadata: ${e}`)
    console.log(publicKey(mint));
}




  });
});
