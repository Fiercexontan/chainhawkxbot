import { createPublicClient, createWalletClient, http, formatEther, parseEther, formatGwei } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { flowTestnet } from 'viem/chains';
import { config } from '../../config/env.js';
import type { ChainAdapter } from '../chain.interface.js';

const publicClient = createPublicClient({
  chain: flowTestnet,
  transport: http(config.flowTestnetRpcUrl),
});

export const flowTestnetAdapter: ChainAdapter = {
  chainId: 'flow-testnet',
  displayName: 'Flow EVM Testnet',
  nativeCurrencySymbol: 'FLOW',
  explorerChainId: 545,
  coingeckoId: 'flow',
  getExplorerTxUrl: (txHash: string) => `https://evm-testnet.flowscan.io/tx/${txHash}`,

  async getBalance(address: string): Promise<string> {
    const balanceWei = await publicClient.getBalance({ address: address as `0x${string}` });
    return formatEther(balanceWei);
  },

  async sendTransaction({ privateKey, to, amountEth }): Promise<string> {
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    const walletClient = createWalletClient({
      account,
      chain: flowTestnet,
      transport: http(config.flowTestnetRpcUrl),
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