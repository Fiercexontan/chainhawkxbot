import { Telegraf } from 'telegraf';
import { logger } from '../../logger/logger.js';
import { upsertUser } from '../../users/user.service.js';
import { getWalletForUser } from '../../wallets/wallet.service.js';
import { getChainAdapter } from '../../blockchain/registry.js';
import { formatBalance } from '../../blockchain/format.js';

export function registerBalanceHandler(bot: Telegraf): void {
  bot.command('balance', async (ctx) => {
    if (!ctx.from) return;

    const chainArg = ctx.message.text.trim().split(/\s+/)[1];

    const user = await upsertUser({
      telegramId: ctx.from.id,
      username: ctx.from.username,
      firstName: ctx.from.first_name,
    });

    const wallet = await getWalletForUser(user.id);
    if (!wallet) {
      await ctx.reply("You don't have a wallet yet - send /wallet first to create one.");
      return;
    }

    let adapter;
    try {
      adapter = getChainAdapter(chainArg);
    } catch {
      await ctx.reply('Unknown chain. Try: `/balance` (Sepolia) or `/balance bsc`', {
        parse_mode: 'Markdown',
      });
      return;
    }

    await ctx.reply(`🔎 Checking your balance on ${adapter.displayName}...`);
    const balance = await adapter.getBalance(wallet.address);

    await ctx.reply(
      `💰 *${adapter.displayName} Balance*\n\n\`${wallet.address}\`\n\n${formatBalance(balance)} ${adapter.nativeCurrencySymbol}`,
      { parse_mode: 'Markdown' }
    );
  });
}