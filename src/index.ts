import { createBot } from './telegram/bot.js';
import { logger } from './logger/logger.js';
import { config } from './config/env.js';

const bot = createBot();

if (config.webhookDomain) {
  // Production (Render): Telegram pushes updates to us directly.
  // No constant polling loop needed - the process can sleep between messages.
  bot
    .launch({
      webhook: {
        domain: config.webhookDomain,
        port: config.port,
        secretToken: config.webhookSecret,
      },
    })
    .catch((err) => {
      logger.fatal({ err }, 'Failed to launch bot in webhook mode');
      process.exit(1);
    });
  logger.info({ domain: config.webhookDomain }, 'Bot launched in webhook mode');
} else {
  // Local dev: no public HTTPS domain exists, so polling is simplest -
  // exactly the same behavior this project has had since Phase 0.
  bot.launch().catch((err) => {
    logger.fatal({ err }, 'Failed to launch bot in polling mode');
    process.exit(1);
  });
  logger.info('Bot launch initiated - now polling Telegram for updates');
}

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));