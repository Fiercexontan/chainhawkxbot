# Phase 1 — User Management

## Problem
The bot needs to recognize returning users instead of treating every
message as a stranger. That requires persistence.

## Approach
Prisma ORM 7 + SQLite locally, with a driver adapter (`@prisma/adapter-better-sqlite3`)
since Prisma 7 removed its bundled engine. Postgres/Supabase at deploy time
is a one-line change to `prisma.config.ts`, not a rewrite.

## Architecture
`src/database/db.ts` is the single Prisma Client instance the whole app
shares (Database Layer). `src/users/user.service.ts` wraps all user
persistence logic (User Management) - Telegram handlers never touch
Prisma directly, they call `upsertUser()`. If we ever add a second
interface, the same service layer works unchanged.

## Implementation
- `prisma/schema.prisma` - `User` model: separate internal `id` (cuid)
  from `telegramId` (BigInt, unique) so identity isn't tied to Telegram
- `upsertUser()` - update-or-create in one call, since `/start` can fire
  many times for the same person

## Lessons Learned
`tsx watch`'s hot-reload doesn't reliably kill a Telegraf long-polling
loop - old and new bot instances can run simultaneously after a save,
each grabbing updates unpredictably. This looked like "the database isn't
saving" for over an hour, when the real issue was stale code still
running. Diagnosis: same-process write+read test proved the adapter and
schema worked; only then did we suspect the running process itself.
Fix/rule: always fully restart (`Ctrl+C` + `npm run dev`) after changing
any Telegram handler, don't trust the watcher for those changes.

Prisma 7's driver-adapter model, `prisma.config.ts`, and the
`prisma-client` generator are all recent changes - most tutorials and
AI training data still show the older `prisma-client-js` pattern.
Verify against the installed version before trusting remembered syntax.

## Future Improvements
- Add a `lastActiveAt` field, updated on every command, not just `/start`
- Consider soft-delete instead of hard delete if we ever need "user blocked the bot" tracking