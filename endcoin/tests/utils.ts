import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Endcoin } from "../target/types/endcoin";
import { 
  PublicKey, 
  Keypair, 
  Connection,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { 
  TOKEN_2022_PROGRAM_ID, 
  ExtensionType, 
  getMintLen,
  createInitializeMintInstruction,
  createInitializeMintCloseAuthorityInstruction
} from '@solana/spl-token';
import { ASSOCIATED_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import * as dotenv from 'dotenv';

// Load environment variables
console.log("Current working directory:", process.cwd());
dotenv.config();

// Initialize provider and program
export const provider = anchor.AnchorProvider.env();
anchor.setProvider(provider);
export const connection = provider.connection;
export const program = anchor.workspace.Endcoin as Program<Endcoin>;

// Initialize keypairs from environment
const payerPrivateKey = JSON.parse(process.env.PAYER_PRIVATE_KEY || '[]');
export const payer = Keypair.fromSecretKey(Uint8Array.from(payerPrivateKey));

const adminPrivateKey = JSON.parse(process.env.ADMIN_PRIVATE_KEY || '[]');
export const admin = Keypair.fromSecretKey(Uint8Array.from(adminPrivateKey));

// Utility functions for finding PDAs
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

// Find common PDAs
export function findProgramAddresses(
  mintA: PublicKey,
  mintB: PublicKey,
  ammId: PublicKey
) {
  const [authority] = PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode("authority")],
    program.programId
  );

  const [amm] = PublicKey.findProgramAddressSync(
    [
      anchor.utils.bytes.utf8.encode("amm"),
      ammId.toBuffer(),
    ],
    program.programId
  );

  const [pool] = PublicKey.findProgramAddressSync(
    [
      amm.toBuffer(),
      mintA.toBuffer(),
      mintB.toBuffer(),
    ],
    program.programId
  );

  const [poolAuthority] = PublicKey.findProgramAddressSync(
    [
      amm.toBuffer(),
      mintA.toBuffer(),
      mintB.toBuffer(),
      anchor.utils.bytes.utf8.encode("pool-authority"),
    ],
    program.programId
  );

  const [rewardVault] = PublicKey.findProgramAddressSync(
    [
      pool.toBuffer(),
      mintA.toBuffer(),
      mintB.toBuffer(),
      anchor.utils.bytes.utf8.encode("reward-vault"),
    ],
    program.programId
  );

  return {
    authority,
    amm,
    pool,
    poolAuthority,
    rewardVault
  };
}

// Token creation utility
export async function createMint(
  payer: anchor.web3.Keypair, 
  mint: anchor.web3.Keypair, 
  program: Program<Endcoin>
): Promise<anchor.web3.Keypair> {
  const [mintAuthority] = PublicKey.findProgramAddressSync(
    [anchor.utils.bytes.utf8.encode("authority")],
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
    createInitializeMintCloseAuthorityInstruction(
      mint.publicKey, 
      closeAuthority.publicKey, 
      TOKEN_2022_PROGRAM_ID
    ),
    createInitializeMintInstruction(
      mint.publicKey,
      6, // decimals
      mintAuthority,
      freezeAuthority.publicKey,
      TOKEN_2022_PROGRAM_ID
    )
  );

  await sendAndConfirmTransaction(
    connection, 
    transaction, 
    [payer, mint], 
    undefined
  );

  return mint;
}

// Utility for waiting for transaction confirmation
export async function confirmTx(signature: string) {
  const latestBlockHash = await connection.getLatestBlockhash();
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: signature,
  });
}

// Utility for getting transaction logs
export async function getTxLogs(signature: string) {
  const tx = await connection.getTransaction(signature, {
    maxSupportedTransactionVersion: 0,
    commitment: "confirmed",
  });
  return tx?.meta?.logMessages || [];
}

// Airdrop utility
export async function requestAirdrop(
  address: PublicKey, 
  amount: number = 10 * anchor.web3.LAMPORTS_PER_SOL
) {
  const signature = await connection.requestAirdrop(address, amount);
  await confirmTx(signature);
  return signature;
}

// Constants
export const DECIMALS = 6;
export const DEFAULT_MINT_AMOUNT = new anchor.BN(1000000); // 1 token with 6 decimals
export const DEFAULT_SWAP_AMOUNT = new anchor.BN(100000);  // 0.1 token
export const DEFAULT_FEE = 500; // 0.5%

// Error handling utility
export class TestError extends Error {
  constructor(message: string, public logs?: string[]) {
    super(message);
    this.name = 'TestError';
  }
}

// Transaction execution wrapper with error handling
export async function executeTx(
  description: string,
  txPromise: Promise<string>
): Promise<string> {
  try {
    const signature = await txPromise;
    await confirmTx(signature);
    const logs = await getTxLogs(signature);
    console.log(`${description} successful:`, signature);
    return signature;
  } catch (error) {
    console.error(`${description} failed:`, error);
    if ('logs' in error) {
      console.error('Transaction logs:', error.logs);
    }
    throw new TestError(`${description} failed`, error.logs);
  }
}