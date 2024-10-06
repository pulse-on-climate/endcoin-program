import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Endcoin } from "../target/types/endcoin";
const ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import wallet_key from "./keys/wba-wallet.json"

const key = new Uint8Array(wallet_key);
const pubkey = bs58.encode(key);


describe("kinobi-test", () => {
  anchor.setProvider(anchor.AnchorProvider.env());
  const program = anchor.workspace.Endcoin as Program<Endcoin>;
  const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
 [
      Buffer.from("example"),
      program.provider.publicKey.toBuffer()
 ],
    program.programId
 )
  it("Is initialized!", async () => {
        const tx = await program.methods
    .createAmm(program.provider.publicKey, 500)
    .accountsStrict({
        admin: pubkey,
        amm: pda,
        state: "",
        payer: "",
        systemProgram: ""
    }).rpc();

 });


//   it("Can set data!", async () => {
//     const tx = await program.methods
//  .setData(10)
//  .accountsStrict({
//         authority: program.provider.publicKey,
//         pda
//  })
//  .rpc({skipPreflight: true});
// });
});