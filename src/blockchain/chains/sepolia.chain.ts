import { createPublicClient, http, formatEther } from 'viem';
import { sepolia } from 'viem/chains';
import { config } from '../../config/env.js';
import type { ChainAdapter } from '../chain.interface.js';

const client = createPublicClient({
  chain: sepolia,
  transport: http(config.sepoliaRpcUrl),
});

export const sepoliaAdapter: ChainAdapter = {
  chainId: 'sepolia',
  displayName: 'Ethereum Sepolia',

  async getBalance(address: string): Promise<string> {
    const balanceWei = await client.getBalance({ address: address as `0x${string}` });
    return formatEther(balanceWei);
  },
};