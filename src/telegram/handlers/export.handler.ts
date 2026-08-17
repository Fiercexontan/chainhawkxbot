import { Telegraf, Markup } from 'telegraf';
import { logger } from '../../logger/logger.js';
import { upsertUser } from '../../users/user.service.js';
import { getWalletForUser, getDecryptedPrivateKey } from '../../wallets/wallet.service.js';

const AUTO_DELETE_MS = 60_000;

export function registerExportHandler(bot: Telegraf): void {
  bot.command('export', async (ctx) => {
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

    await ctx.reply(
      `⚠️ *Export Private Key*\n\n` +
        `Anyone who sees this key has *full, irreversible control* of this wallet - ` +
        `they can drain it instantly, with no way to undo it.\n\n` +
        `Only continue somewhere private - not a shared screen, not a public space.\n\n` +
        `The key auto-deletes from this chat 60 seconds after being shown. Copy it immediately.`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          Markup.button.callback('⚠️ Show my private key', 'confirm_export'),
          Markup.button.callback('Cancel', 'cancel_export'),
        ]),
      }
    );
  });

  bot.action('cancel_export', async (ctx) => {
    await ctx.answerCbQuery('Cancelled');
    await ctx.editMessageText('Export cancelled. Your key was never shown.');
  });

  bot.action('confirm_export', async (ctx) => {
    if (!ctx.from) return;
    await ctx.answerCbQuery();

    const user = await upsertUser({
      telegramId: ctx.from.id,
      username: ctx.from.username,
      firstName: ctx.from.first_name,
    });

    const privateKey = await getDecryptedPrivateKey(user.id);

    await ctx.editMessageText('🔓 Key sent below - copy it now, it self-deletes in 60 seconds.');
    const sent = await ctx.reply(`\`${privateKey}\``, { parse_mode: 'Markdown' });

    logger.warn({ userId: user.telegramId.toString() }, 'Private key exported by user');

    setTimeout(() => {
      ctx.telegram.deleteMessage(sent.chat.id, sent.message_id).catch((err) => {
        logger.error({ err }, 'Failed to auto-delete exported key message');
      });
    }, AUTO_DELETE_MS);
  });
}