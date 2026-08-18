import { getAllChainAdapters } from './registry.js';
import { getUsdPrices } from '../pricing/price.service.js';

export interface ChainHolding {
  chainId: string;
  displayName: string;
  balance: string | null; // null = fetch failed, distinct from a real zero
  symbol: string;
  usdValue: number | null;
}

export interface PortfolioSummary {
  holdings: ChainHolding[];
  totalUsd: number;
}

export async function getPortfolio(address: string): Promise<PortfolioSummary> {
  const adapters = getAllChainAdapters();

  const balances = await Promise.all(
    adapters.map(async (adapter) => ({
      adapter,
      balance: await adapter.getBalance(address).catch(() => null),
    }))
  );

  let prices: Record<string, number> = {};
  try {
    prices = await getUsdPrices(adapters.map((a) => a.coingeckoId));
  } catch {
    prices = {}; // degrade to balances-without-USD rather than failing the whole command
  }

  const holdings: ChainHolding[] = balances.map(({ adapter, balance }) => {
    const price = prices[adapter.coingeckoId];
    const usdValue = balance !== null && price !== undefined ? Number(balance) * price : null;
    return {
      chainId: adapter.chainId,
      displayName: adapter.displayName,
      balance,
      symbol: adapter.nativeCurrencySymbol,
      usdValue,
    };
  });

  const totalUsd = holdings.reduce((sum, h) => sum + (h.usdValue ?? 0), 0);
  return { holdings, totalUsd };
}