import { Telegraf } from 'telegraf';
import { getAllChainAdapters } from '../../blockchain/registry.js';

export function registerStatusHandler(bot: Telegraf): void {
  bot.command('status', async (ctx) => {
    const adapters = getAllChainAdapters();

    const results = await Promise.all(
      adapters.map(async (adapter) => {
        try {
          const status = await adapter.getNetworkStatus();
          return `*${adapter.displayName}*\nBlock: ${status.blockNumber}\nGas: ${status.gasPriceGwei} gwei`;
        } catch {
          return `*${adapter.displayName}*\n⚠️ Unreachable right now`;
        }
      })
    );

    await ctx.reply(`📡 *Network Status*\n\n${results.join('\n\n')}`, {
      parse_mode: 'Markdown',
    });
  });
}