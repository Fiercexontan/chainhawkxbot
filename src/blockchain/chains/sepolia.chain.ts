import { createPublicClient, createWalletClient, formatEther, formatGwei, http, parseEther } from 'viem';
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
  nativeCurrencySymbol: 'ETH',
  explorerChainId: 11155111,
  getExplorerTxUrl: (txHash: string) => `https://sepolia.etherscan.io/tx/${txHash}`,

  async getBalance(address: string): Promise<string> {
    const balanceWei = await publicClient.getBalance({ address: address as `0x${string}` });
    return formatEther(balanceWei);
  },
  
  async getNetworkStatus() {
    const [blockNumber, gasPrice] = await Promise.all([
      publicClient.getBlockNumber(),
      publicClient.getGasPrice(),
    ]);
    return { blockNumber, gasPriceGwei: formatGwei(gasPrice) };
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