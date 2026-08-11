import { createBot } from './telegram/bot.js';
import { logger } from './logger/logger.js';

const bot = createBot();

// launch() intentionally never resolves while polling is active - by design,
// so the process stays alive. So we log readiness right after calling it,
// not chained onto its resolution.
bot.launch().catch((err) => {
  logger.fatal({ err }, 'Failed to launch bot');
  process.exit(1);
});

logger.info('Bot launch initiated - now polling Telegram for updates');

// Graceful shutdown - matters once we add DB connections and background jobs.
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));