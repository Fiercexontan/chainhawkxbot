import { Telegraf } from 'telegraf';
import { logger } from '../../logger/logger.js';
import { upsertUser } from '../../users/user.service.js';
import { getWalletForUser } from '../../wallets/wallet.service.js';
import { getChainAdapter } from '../../blockchain/registry.js';
import { getTransactionHistory } from '../../blockchain/explorer.service.js';

export function registerHistoryHandler(bot: Telegraf): void {
  bot.command('history', async (ctx) => {
    if (!ctx.from) return;

    const chainArg = ctx.message.text.trim().split(/\s+/)[1];

    const user = await upsertUser({
      telegramId: ctx.from.id,
      username: ctx.from.username,
      firstName: ctx.from.first_name,
    });

    const wallet = await getWalletForUser(user.id);
    if (!wallet) {
      await ctx.reply("You don't have a wallet yet - send /wallet first.");
      return;
    }

    let adapter;
    try {
      adapter = getChainAdapter(chainArg);
    } catch {
      await ctx.reply('Unknown chain. Try: `/history` (Sepolia) or `/history bsc`', {
        parse_mode: 'Markdown',
      });
      return;
    }

    await ctx.reply(`🔎 Fetching recent history on ${adapter.displayName}...`);

    try {
      const txs = await getTransactionHistory(adapter, wallet.address);

      if (txs.length === 0) {
        await ctx.reply(`No transactions found yet on ${adapter.displayName}.`);
        return;
      }

      const lines = txs.map((tx) => {
        const direction =
          tx.from.toLowerCase() === wallet.address.toLowerCase() ? '↗️ Sent' : '↘️ Received';
        return `${direction} ${tx.valueEth} ${adapter.nativeCurrencySymbol} - [${tx.hash.slice(0, 10)}...](${adapter.getExplorerTxUrl(tx.hash)})\n${tx.timestamp.toLocaleString()}`;
      });

      await ctx.reply(`📜 *Recent Transactions - ${adapter.displayName}*\n\n${lines.join('\n\n')}`, {
        parse_mode: 'Markdown',
      });
    } catch (err) {
      logger.error({ err, userId: user.telegramId.toString() }, 'Failed to fetch transaction history');
      await ctx.reply(
        "⚠️ Couldn't fetch history right now - the explorer service may be temporarily unavailable. Try again shortly."
      );
    }
  });
}