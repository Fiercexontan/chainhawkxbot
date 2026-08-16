import type { ChainAdapter } from './chain.interface.js';
import { sepoliaAdapter } from './chains/sepolia.chain.js';
import { bscTestnetAdapter } from './chains/bsc-testnet.chain.js';

const chains: Record<string, ChainAdapter> = {
  sepolia: sepoliaAdapter,
  bsc: bscTestnetAdapter,
  'bsc-testnet': bscTestnetAdapter,
};

export const DEFAULT_CHAIN_ID = 'sepolia';

export function getAllChainAdapters(): ChainAdapter[] {
  const seen = new Set<string>();
  const unique: ChainAdapter[] = [];
  for (const adapter of Object.values(chains)) {
    if (!seen.has(adapter.chainId)) {
      seen.add(adapter.chainId);
      unique.push(adapter);
    }
  }
  return unique;
}

export function getChainAdapter(chainId?: string): ChainAdapter {
  const adapter = chains[(chainId ?? DEFAULT_CHAIN_ID).toLowerCase()];
  if (!adapter) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }
  return adapter;
}