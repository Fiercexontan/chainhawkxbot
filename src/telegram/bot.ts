import { Telegraf } from 'telegraf';
import { config } from '../config/env.js';
import { logger } from '../logger/logger.js';
import { registerStartHandler } from './handlers/start.handler.js';
import { registerHelpHandler } from './handlers/help.handler.js';
import { registerWalletHandler } from './handlers/wallet.handler.js';
import { registerBalanceHandler } from './handlers/balance.handler.js';
import { registerSendHandler } from './handlers/send.handler.js';
import { registerStatusHandler } from './handlers/status.handler.js';
import { registerExportHandler } from './handlers/export.handler.js';
import { registerHistoryHandler } from './handlers/history.handler.js';
import { registerPortfolioHandler } from './handlers/portfolio.handler.js';
export function createBot(): Telegraf {
  const bot = new Telegraf(config.botToken);

  // Global error boundary: one bad update should never crash the process.
  bot.catch((err, ctx) => {
    logger.error({ err, updateType: ctx.updateType }, 'Unhandled bot error');
  });

  registerStartHandler(bot);
  registerHelpHandler(bot);
  registerWalletHandler(bot);
  registerBalanceHandler(bot);
  registerSendHandler(bot);
  registerStatusHandler(bot);
  registerExportHandler(bot);
  registerHistoryHandler(bot);
  registerPortfolioHandler(bot);
  return bot;
}
