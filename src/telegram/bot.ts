import { Telegraf } from 'telegraf';
import { config } from '../config/env.js';
import { logger } from '../logger/logger.js';
import { registerStartHandler } from './handlers/start.handler.js';
import { registerHelpHandler } from './handlers/help.handler.js';

export function createBot(): Telegraf {
  const bot = new Telegraf(config.botToken);

  // Global error boundary: one bad update should never crash the process.
  bot.catch((err, ctx) => {
    logger.error({ err, updateType: ctx.updateType }, 'Unhandled bot error');
  });

  registerStartHandler(bot);
  registerHelpHandler(bot);
  return bot;
}
