// example of ts sending two function instructions in the same transaction
// always triggers in the order that they are added. 

const coolFunction = await program.methods // switchboard
.createAmm(values.id, values.fee)
.accounts({ amm: values.ammKey, admin: values.admin.publicKey })
.instruction(); // instead of RPC

const coolFunction2 = await program.methods // deposit liquidity
.createAmm(values.id, values.fee)
.accounts({ amm: values.ammKey, admin: values.admin.publicKey })
.instruction(); // instead of RPC

const tx = new anchor.web3.Transaction().add(coolFunction).add(coolFunction2);

await provider.sendAndConfirm(tx, [ signer ]);
