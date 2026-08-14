import { Telegraf } from 'telegraf';
import { logger } from '../../logger/logger.js';
import { upsertUser } from '../../users/user.service.js';
import { getWalletForUser } from '../../wallets/wallet.service.js';
import { sepoliaAdapter } from '../../blockchain/chains/sepolia.chain.js';

export function registerBalanceHandler(bot: Telegraf): void {
  bot.command('balance', async (ctx) => {
    if (!ctx.from) {
      logger.warn('Received /balance with no ctx.from - ignoring');
      return;
    }

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

    await ctx.reply('🔎 Checking your balance on Sepolia...');

    const balance = await sepoliaAdapter.getBalance(wallet.address);

    await ctx.reply(
      `💰 *Sepolia Balance*\n\n\`${wallet.address}\`\n\n${balance} ETH`,
      { parse_mode: 'Markdown' }
    );
  });
}