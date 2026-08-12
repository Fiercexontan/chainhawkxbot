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

    // user.telegramId is a BigInt - pino can't serialize BigInt directly
    // and will throw. Always convert to string before logging it.
    logger.info({ userId: user.telegramId.toString() }, 'User started the bot');

    ctx.reply(
      "Hey! I'm your blockchain assistant. I'm still early in development - " +
        'right now I can just say hello, but wallet and chain features are on the way.'
    );
  });
}