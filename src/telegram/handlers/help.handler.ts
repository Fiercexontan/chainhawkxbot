import { Telegraf } from 'telegraf';

export function registerHelpHandler(bot: Telegraf): void {
  bot.help(async (ctx) => {
    await ctx.reply(
  `🧭 *ChainHawkXBot* — Roadmap\n\n` +
    `✅ *Live now*\n` +
    `/start — Register your account\n` +
    `/help — This message\n\n` +
    `🔧 *Building next*\n` +
    `Wallet creation & secure export\n` +
    `Multi-chain balance checks\n` +
    `Cross-chain transfers\n` +
    `Portfolio insights\n\n` +
    `Follow along as each ships — nothing here claims more than what's actually running.`,
  { parse_mode: 'Markdown' }
);
  });
}