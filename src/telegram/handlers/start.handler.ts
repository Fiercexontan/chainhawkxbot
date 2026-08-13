import { Telegraf } from 'telegraf';
import { logger } from '../../logger/logger.js';
import { upsertUser } from '../../users/user.service.js';

export function registerStartHandler(bot: Telegraf): void {
  bot.start(async (ctx) => {
    if (!ctx.from) {
      logger.warn('Received /start with no ctx.from - ignoring');
      return;
    }

    const user = await upsertUser({
      telegramId: ctx.from.id,
      username: ctx.from.username,
      firstName: ctx.from.first_name,
    });

    logger.info({ userId: user.telegramId.toString() }, 'User started the bot');

    const firstName = ctx.from.first_name ?? 'there';

    await ctx.reply(
  `👋 Welcome, ${firstName} — I'm *ChainHawkXBot*, your multi-chain blockchain assistant.\n\n` +
    `Wallets, balances, transfers, and portfolio insights — all from inside Telegram, no separate app required.\n\n` +
    `🚧 Actively in development. I'll notify you the moment each capability ships — wallet creation is up first.\n\n` +
    `Type /help to see what's live right now.`,
  { parse_mode: 'Markdown' }
);
  });
}