import { Telegraf } from 'telegraf';

export function registerHelpHandler(bot: Telegraf): void {
  bot.help(async (ctx) => {
    await ctx.reply(
      `🧭 *ChainHawkXBot* — Roadmap\n\n` +
        `✅ *Live now*\n` +
        `/start — Register your account\n` +
        `/wallet — Create or view your wallet\n` +
        `/balance [chain] — Check balance (Sepolia, BSC Testnet)\n` +
        `/send <address> <amount> [chain] — Send a transaction\n` +
        `/status — Network status across all chains\n` +
        `/history [chain] — View recent transactions\n` +
        `/help — This message\n\n` +
        `/export — Export your private key (use with care)\n` +
        `/balance [chain] — Check balance (Sepolia, BSC, Flow)\n` +
        `/send <address> <amount> [chain] — Send a transaction\n` +
        `/portfolio — Total holdings across all chains, in USD\n` +
        `🔧 *Building next*\n` +
        `Transaction notifications\n` +
        `Educational guidance\n\n` +
        `Nothing here claims more than what's actually running.`,
      { parse_mode: 'Markdown' }
    );
  });
}