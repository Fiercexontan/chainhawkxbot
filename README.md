# ChainHawkXBot

A modular, conversational Telegram blockchain assistant — create and manage a crypto wallet, check balances, send transactions, and view your portfolio across multiple chains, entirely through chat.

**Live now:** message [@ChainHawkXBot](https://t.me/ChainHawkXBot) on Telegram.

Built as a professional case study in system design and engineering discipline. For the full story — including the real debugging battles and lessons learned — see [`docs/case-study-brief.md`](case-study-brief.md). For the detailed technical build log, see `docs/phase-0` through `docs/phase-12`.

## Features

- `/start` — Register your account
- `/wallet` — Create or view your wallet
- `/balance [chain]` — Check balance (Sepolia, BSC Testnet, Flow EVM Testnet)
- `/send <address> <amount> [chain]` — Send a real signed transaction
- `/status` — Live network status across all chains
- `/export` — Export your private key (two-step confirmation, auto-deletes from chat)
- `/history [chain]` — Recent transaction history
- `/portfolio` — Total holdings across all chains, in USD
- `/help` — Command list

## Tech Stack

- **Runtime:** Node.js + TypeScript (strict, ESM)
- **Bot framework:** Telegraf.js
- **Blockchain:** viem, targeting Ethereum Sepolia, BSC Testnet, Flow EVM Testnet
- **Database:** Prisma ORM 7 + Supabase (Postgres)
- **External APIs:** Etherscan V2 (transaction history), CoinGecko (USD pricing)
- **Hosting:** Render (webhook mode in production, long-polling for local dev)
- **Security:** AES-256-GCM encryption at rest for private keys

## Architecture

Organized into independent modules with a single responsibility each: Telegram Interface, Command Processing, User Management, Wallet Management, Blockchain Services (via a `ChainAdapter` interface, implemented once per chain), Database Layer, Security, Pricing, Configuration, and Logging. See `docs/phase-0-foundations.md` for the full architectural reasoning.

## Local Setup

```bash
npm install
cp .env.example .env
# Fill in: BOT_TOKEN (from @BotFather), ENCRYPTION_SECRET (32-byte hex),
# DATABASE_URL + DIRECT_URL (Supabase Postgres), SEPOLIA_RPC_URL,
# BSC_TESTNET_RPC_URL, FLOW_TESTNET_RPC_URL, ETHERSCAN_API_KEY,
# COINGECKO_API_KEY
npx prisma generate
npm run dev
```
Message your bot on Telegram, send `/start`.

## Deployment

Deployed on Render as a web service, using Telegram webhooks rather than polling (see `docs/phase-12-deployment.md` for why). Build command:

## npm install && npx prisma generate && npm run build

Start command: `npm start`. Requires `WEBHOOK_DOMAIN` and `WEBHOOK_SECRET` set in addition to the local env vars.

## Documentation

Every phase of this build is documented as its own case study entry in `docs/` — problem, approach, architecture, implementation, lessons learned, and future improvements — reflecting real decisions and real debugging, not a cleaned-up retrospective.
