import { Telegraf } from 'telegraf';
import { logger } from '../../logger/logger.js';

export function registerStartHandler(bot: Telegraf): void {
  bot.start((ctx) => {
    logger.info({ userId: ctx.from?.id }, 'User started the bot');
    ctx.reply(
      "Hey! I'm your blockchain assistant. I'm still early in development - " +
        'right now I can just say hello, but wallet and chain features are on the way.'
    );
  });
}
