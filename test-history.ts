import { getTransactionHistory } from './src/blockchain/explorer.service.js';
import { sepoliaAdapter } from './src/blockchain/chains/sepolia.chain.js';

const txs = await getTransactionHistory(sepoliaAdapter, '0xB16b418ceE824c7918461e8038116896F186e199');
console.log(`Found ${txs.length} transactions:`);
console.log(txs);