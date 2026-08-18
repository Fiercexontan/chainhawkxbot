import { createPublicClient, createWalletClient, http, formatEther, parseEther, formatGwei } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bscTestnet } from 'viem/chains';
import { config } from '../../config/env.js';
import type { ChainAdapter } from '../chain.interface.js';

const publicClient = createPublicClient({
  chain: bscTestnet,
  transport: http(config.bscTestnetRpcUrl),
});

export const bscTestnetAdapter: ChainAdapter = {
  chainId: 'bsc-testnet',
  displayName: 'BSC Testnet',
  nativeCurrencySymbol: 'tBNB',
  explorerChainId: 97,
  coingeckoId: 'binancecoin',
  getExplorerTxUrl: (txHash: string) => `https://testnet.bscscan.com/tx/${txHash}`,

  async getBalance(address: string): Promise<string> {
    const balanceWei = await publicClient.getBalance({ address: address as `0x${string}` });
    return formatEther(balanceWei);
  },

  async sendTransaction({ privateKey, to, amountEth }): Promise<string> {
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: bscTestnet,
      transport: http(config.bscTestnetRpcUrl),
    });
    return walletClient.sendTransaction({ to: to as `0x${string}`, value: parseEther(amountEth) });
  },

  async getNetworkStatus() {
    const [blockNumber, gasPrice] = await Promise.all([
      publicClient.getBlockNumber(),
      publicClient.getGasPrice(),
    ]);
    return { blockNumber, gasPriceGwei: formatGwei(gasPrice) };
  },
};