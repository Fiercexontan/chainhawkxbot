import { config } from '../config/env.js';

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3/simple/price';

export async function getUsdPrices(coinIds: string[]): Promise<Record<string, number>> {
  const uniqueIds = [...new Set(coinIds)];
  const url = new URL(COINGECKO_BASE_URL);
  url.searchParams.set('ids', uniqueIds.join(','));
  url.searchParams.set('vs_currencies', 'usd');
  url.searchParams.set('x_cg_demo_api_key', config.coingeckoApiKey);

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(`CoinGecko API error: ${JSON.stringify(data)}`);
  }

  const prices: Record<string, number> = {};
  for (const id of uniqueIds) {
    if (data[id]?.usd !== undefined) {
      prices[id] = data[id].usd;
    }
  }
  return prices;
}