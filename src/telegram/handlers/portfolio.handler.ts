import { Telegraf } from 'telegraf';
import { logger } from '../../logger/logger.js';
import { upsertUser } from '../../users/user.service.js';
import { getWalletForUser } from '../../wallets/wallet.service.js';
import { getPortfolio } from '../../blockchain/portfolio.service.js';
import { formatBalance } from '../../blockchain/format.js';

export function registerPortfolioHandler(bot: Telegraf): void {
  bot.command('portfolio', async (ctx) => {
    if (!ctx.from) return;

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

    await ctx.reply('🔎 Gathering your portfolio across all chains...');

    try {
      const portfolio = await getPortfolio(wallet.address);

      const lines = portfolio.holdings.map((h) => {
        if (h.balance === null) {
          return `*${h.displayName}*\n⚠️ Could not fetch balance`;
        }
        const usdPart =
          h.usdValue !== null ? ` (~$${h.usdValue.toFixed(2)})` : ' (price unavailable)';
        return `*${h.displayName}*\n${formatBalance(h.balance)} ${h.symbol}${usdPart}`;
      });

      await ctx.reply(
        `📊 *Portfolio*\n\n${lines.join('\n\n')}\n\n💵 *Total: ~$${portfolio.totalUsd.toFixed(2)}*`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      logger.error({ err, userId: user.telegramId.toString() }, 'Failed to fetch portfolio');
      await ctx.reply('⚠️ Could not fetch your portfolio right now - try again shortly.');
    }
  });
}