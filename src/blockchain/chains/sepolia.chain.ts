import { createPublicClient, createWalletClient, http, formatEther, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { config } from '../../config/env.js';
import type { ChainAdapter } from '../chain.interface.js';

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(config.sepoliaRpcUrl),
});

export const sepoliaAdapter: ChainAdapter = {
  chainId: 'sepolia',
  displayName: 'Ethereum Sepolia',

  async getBalance(address: string): Promise<string> {
    const balanceWei = await publicClient.getBalance({ address: address as `0x${string}` });
    return formatEther(balanceWei);
  },

  async sendTransaction({ privateKey, to, amountEth }): Promise<string> {
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: sepolia,
      transport: http(config.sepoliaRpcUrl),
    });

    return walletClient.sendTransaction({
      to: to as `0x${string}`,
      value: parseEther(amountEth),
    });
  },
};