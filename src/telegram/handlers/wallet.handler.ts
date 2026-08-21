import { Telegraf } from 'telegraf';
import { logger } from '../../logger/logger.js';
import { upsertUser } from '../../users/user.service.js';
import { createWalletForUser, getWalletForUser } from '../../wallets/wallet.service.js';
import { getAllChainAdapters } from '../../blockchain/registry.js';

export function registerWalletHandler(bot: Telegraf): void {
  bot.command('wallet', async (ctx) => {
    if (!ctx.from) {
      logger.warn('Received /wallet with no ctx.from - ignoring');
      return;
    }

    // Defensive: a user could technically send /wallet before ever sending
    // /start. upsertUser is idempotent, so this is safe either way.
    const user = await upsertUser({
      telegramId: ctx.from.id,
      username: ctx.from.username,
      firstName: ctx.from.first_name,
    });

    const chainList = getAllChainAdapters()
      .map((a) => a.displayName)
      .join(', ');

    const existing = await getWalletForUser(user.id);

    if (existing) {
      await ctx.reply(
        `✅ *Wallet already exists*\n\n\`${existing.address}\`\n\n` +
          `This address works across every chain I support: ${chainList}.\n\n` +
          `Try /balance to check what's in it, or /portfolio for the full picture.`,
        { parse_mode: 'Markdown' }
      );
      return;
    }

    const wallet = await createWalletForUser(user.id);
    logger.info(
      { userId: user.telegramId.toString(), address: wallet.address },
      'Wallet created for user'
    );

    await ctx.reply(
      `✅ *Wallet created*\n\n\`${wallet.address}\`\n\n` +
        `This is your address across every EVM chain I support. Keep it handy - ` +
        `you'll use it to receive test funds once balance checks are live.`,
      { parse_mode: 'Markdown' }
    );
  });
}