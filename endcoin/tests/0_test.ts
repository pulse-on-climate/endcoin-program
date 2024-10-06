import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Endcoin } from "../target/types/endcoin";
const ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import wallet from "./keys/wba-wallet.json";
import * as generated from '../../clients/js/src/generated/index';
import { getSwapExactTokensForTokensInstruction, getCreatePoolInstruction } from '../../clients/js/src/generated/instructions';


const key = new Uint8Array(wallet);
const pubkey = bs58.encode(key);
const connection = new anchor.web3.Connection(ANCHOR_PROVIDER_URL);
const myWallet = anchor.web3.Keypair.fromSecretKey(key);

const ENDCOIN_PROGRAM_ADDRESS = generated.ENDCOIN_PROGRAM_ADDRESS;

// generate keypair for amm
const ammKey = anchor.web3.Keypair.generate();


xdescribe("kinobi-test", async () => {
  anchor.setProvider(new anchor.AnchorProvider(connection, new anchor.Wallet(myWallet)));
  const program = anchor.workspace.Endcoin as Program<Endcoin>;
  

  xit("Create SST", async () => {


 

    const [pda] = await anchor.web3.PublicKey.findProgramAddressSync(
        [
             Buffer.from("seaSurfaceTemperature"),
        ],
           program.programId
        );

        const tx = await program.methods
            .createSst()
            .accounts({
                sst: pda,
                payer: myWallet.publicKey,
                systemProgram: progID,
            }).rpc();

 });

 xit("Create AMM", async () => {

    const [amm_pda] = await anchor.web3.PublicKey.findProgramAddressSync(
        [
             Buffer.from("amm"),
        ],
           program.programId
        );
        try {
            const tx = await program.methods
                .createAmm(ammKey.publicKey, 500)
                .accounts({
                    amm: amm_pda,
                    payer: myWallet.publicKey,
                    systemProgram: progID,
                    admin: myWallet.publicKey
             
                }).rpc();
        } catch (error) {
            console.log(error);
        }
 });

    xit("Create Pool", async () => {
        const [pool_pda] = await anchor.web3.PublicKey.findProgramAddressSync(
            [
                Buffer.from("pool"),
            ],
            program.programId
            );
    
            try {
                const tx = await program.methods
                    .createPool()
                    .accounts({
                        pool: pool_pda,
                        payer: myWallet.publicKey,
                        systemProgram: progID,
                    }).rpc();
            } catch (error) {
                console.log(error);
            }
    });



 it("Create Endcoin", async () => {
    const [pool_pda] = await anchor.web3.PublicKey.findProgramAddressSync(
        [
             Buffer.from("state"),
             Buffer.from("2EEHXKU1t4A6QzJtQ2Z17Hr6XLy6YnERi51uGKZn2iND"),
        ],
           program.programId
        );

        // false for endcoin, true for gaiacoin
        try {

            const tx = await program.methods
                .createMintAccount({ token: true }).accounts({
                    mintA: pool_pda,
                    mintB: pool_pda,
                    payer: myWallet.publicKey,
                    systemProgram: progID,
                }).rpc();
        } catch (error) {
            console.log(error);
        }
 });

});