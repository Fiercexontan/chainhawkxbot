# Phase 0 — Foundations

## Problem
Before writing any user-facing feature, we need infrastructure that won't
need to be redone in Phase 3-6: a bot that boots reliably, fails loudly on
misconfiguration instead of crashing mid-conversation, and keeps
Telegram-specific code separate from business logic.

## Approach
Node.js + TypeScript + Telegraf.js. TypeScript because a mistyped address
or amount in wallet code is a silent, expensive bug - the compiler catches
shape mismatches before they ever reach a user. Telegraf because it's the
most mature Telegram bot framework in the JS ecosystem.

## Architecture
Telegram-facing concerns live in `src/telegram/`. Config is centralized and
validated once at startup in `src/config/env.ts` - if `BOT_TOKEN` is
missing, the process refuses to start rather than failing later. Logging
goes through one shared instance in `src/logger/logger.ts` so every future
module logs consistently. `src/blockchain/chain.interface.ts` defines the
contract every chain adapter will implement later - the interface exists
now so multi-chain support is a decision made once, not retrofitted per
chain.

## Implementation
- `src/index.ts` - entry point, launches the bot, handles SIGINT/SIGTERM
- `src/telegram/bot.ts` - builds the Telegraf instance, registers a global
  error boundary so one bad update can't crash the process
- `src/telegram/handlers/start.handler.ts` - first working command
- `src/blockchain/chain.interface.ts` - contract only, no implementation yet

## Lessons Learned
`bot.launch()` does not resolve while long polling is active - that's
intentional Telegraf design, not a bug, so success should be logged right
after calling launch(), not chained onto its resolution.

Glob patterns match substrings: excluding `*.git*` from the deploy zip
also silently excluded `.gitignore` itself. Wildcards need to be checked
against what they actually catch, not just what they're intended to catch.

Any file holding a real secret needs a deliberate check against
`.gitignore` before it's created, not after - a throwaway test script
holding a raw token is a real leak risk if git commands run before cleanup.

## Future Improvements
- Add update-logging middleware
- Add a health-check route if we move from polling to webhooks
- Introduce a command router once handler count passes ~5
