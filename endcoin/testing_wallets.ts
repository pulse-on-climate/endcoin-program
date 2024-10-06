import {

    createKeyPairSignerFromPrivateKeyBytes,

  } from '@solana/web3.js';
  import wallet from "./tests/keys/wba-wallet.json";

  import bs58 from 'bs58';

// let key = new Uint8Array(JSON.parse(wallet));
let base58PrivateKey = bs58.encode(new Uint8Array(wallet));
console.log(base58PrivateKey);

async function test() {
const authority = await createKeyPairSignerFromPrivateKeyBytes(Buffer.from(base58PrivateKey).slice(0, 32));
console.log(authority);
}
test();