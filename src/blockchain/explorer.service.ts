import { formatEther } from 'viem';
import { config } from '../config/env.js';
import type { ChainAdapter } from './chain.interface.js';

const ETHERSCAN_BASE_URL = 'https://api.etherscan.io/v2/api';

export interface TransactionSummary {
  hash: string;
  from: string;
  to: string;
  valueEth: string;
  timestamp: Date;
}

export async function getTransactionHistory(
  adapter: ChainAdapter,
  address: string,
  limit = 5
): Promise<TransactionSummary[]> {
  const url = new URL(ETHERSCAN_BASE_URL);
  url.searchParams.set('chainid', String(adapter.explorerChainId));
  url.searchParams.set('module', 'account');
  url.searchParams.set('action', 'txlist');
  url.searchParams.set('address', address);
  url.searchParams.set('startblock', '0');
  url.searchParams.set('endblock', '99999999');
  url.searchParams.set('page', '1');
  url.searchParams.set('offset', String(limit));
  url.searchParams.set('sort', 'desc');
  url.searchParams.set('apikey', config.etherscanApiKey);

  const res = await fetch(url);
  const data = (await res.json()) as { status: string; message: string; result: unknown };

  // Etherscan uses status "0" for two very different situations - a
  // legitimately empty result, and a genuine failure. The message field
  // is what actually distinguishes them; conflating the two would show
  // a user "no history" when the truth is "we couldn't check."
  if (data.status === '0' && data.message === 'No transactions found') {
    return [];
  }

  if (data.status !== '1') {
    throw new Error(`Etherscan API error: ${JSON.stringify(data.result)}`);
  }

  return (data.result as any[]).slice(0, limit).map((tx: any) => ({
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    valueEth: formatEther(BigInt(tx.value)),
    timestamp: new Date(Number(tx.timeStamp) * 1000),
  }));
}