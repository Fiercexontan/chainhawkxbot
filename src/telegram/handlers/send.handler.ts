import { Telegraf } from 'telegraf';
import { logger } from '../../logger/logger.js';
import { upsertUser } from '../../users/user.service.js';
import { getWalletForUser } from '../../wallets/wallet.service.js';
import { sendFromUserWallet } from '../../blockchain/transaction.service.js';
import { getChainAdapter } from '../../blockchain/registry.js';

const ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export function registerSendHandler(bot: Telegraf): void {
  bot.command('send', async (ctx) => {
    if (!ctx.from) return;

    const parts = ctx.message.text.trim().split(/\s+/);
    const [, toAddress, amountStr, chainArg] = parts;

    if (!toAddress || !amountStr) {
      await ctx.reply(
        'Usage: `/send <address> <amount> [chain]`\nExample: `/send 0x1234...abcd 0.01 bsc`\nDefault chain: Sepolia',
        { parse_mode: 'Markdown' }
      );
      return;
    }

    if (!ADDRESS_REGEX.test(toAddress)) {
      await ctx.reply("That doesn't look like a valid address - it should start with 0x and be 42 characters long.");
      return;
    }

    const amount = Number(amountStr);
    if (!Number.isFinite(amount) || amount <= 0) {
      await ctx.reply('Amount must be a positive number, e.g. 0.01');
      return;
    }

    let adapter;
    try {
      adapter = getChainAdapter(chainArg);
    } catch {
      await ctx.reply('Unknown chain. Supported: sepolia, bsc');
      return;
    }

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
      `Sending ${amountStr} ${adapter.nativeCurrencySymbol} to \`${toAddress}\` on ${adapter.displayName}...`,
      { parse_mode: 'Markdown' }
    );

    try {
      const txHash = await sendFromUserWallet(user.id, toAddress, amountStr, chainArg);
      logger.info(
        { userId: user.telegramId.toString(), txHash, toAddress, amount: amountStr, chain: adapter.chainId },
        'Transaction sent'
      );
      await ctx.reply(`✅ *Sent*\n\n[View Transaction](${adapter.getExplorerTxUrl(txHash)})`, {
        parse_mode: 'Markdown',
      });
    } catch (err) {
      logger.error({ err, userId: user.telegramId.toString() }, 'Send transaction failed');
      await ctx.reply(
        "⚠️ Something went wrong sending this. I can't be certain whether it landed - " +
          "check /balance before retrying, so you don't risk sending twice."
      );
    }
  });
}