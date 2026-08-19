# Phase 11 — Postgres Migration (SQLite → Supabase)

## Problem
Railway's filesystem is ephemeral - SQLite's single-file database would
be wiped on every redeploy, permanently losing every stored wallet.

## Approach
Supabase Postgres, using the same database for both local development
and production (dev/prod parity) rather than maintaining two separate
database dialects and migration histories.

## Architecture
`@prisma/adapter-pg` replaces `@prisma/adapter-better-sqlite3` in
`db.ts` - the rest of the codebase (every service, every handler) needed
zero changes, since nothing outside `db.ts` ever knew which database
engine was underneath Prisma. Two separate connection strings are now
required: `DATABASE_URL` (transaction pooler, port 6543 - what the
running app uses) and `DIRECT_URL` (session pooler, port 5432 - what
Prisma's CLI needs for migrations specifically).

## Lessons Learned
This phase surfaced five distinct, compounding problems, and the real
lesson is the diagnostic method, not any single fix:

1. Supabase's *direct* connection resolves IPv6-only since Jan 2024 -
   most residential networks can't reach it. Fix: use the connection
   pooler instead, which supports IPv4.
2. `.env` silently held two `DATABASE_URL` lines at once - dotenv reads
   only the first match and ignores the rest, so an edit at the top of
   the file appeared to do nothing while an old value below it kept
   winning.
3. `db.ts` reverted twice to an older, pre-adapter Prisma pattern between
   sessions, most likely from editor autocomplete suggesting a
   previously-seen pattern - a reminder to verify a file's actual
   content before trusting it matches what was last written.
4. A manually copy-pasted database password repeatedly failed
   authentication despite looking correct on screen - almost certainly
   an invisible character picked up during manual selection. Using
   Supabase's dedicated copy-icon button instead of manual
   highlight-and-copy resolved it immediately.
5. Windows' C: drive was at exactly 0 bytes free, silently breaking npm
   installs (ENOSPC) even though the project itself lived entirely on
   D: with hundreds of GB free - npm's cache defaults to C: regardless
   of where a project is stored. Fixed by redirecting npm's global cache
   with `npm config set cache "D:\npm-cache" --global`.

None of these were found by guessing. Each was isolated with a narrower,
more direct test than the one before it: Prisma's error → raw TCP test
→ DNS lookup → a standalone `pg` client bypassing Prisma entirely. That
layered narrowing is what actually found the real password-auth error
underneath Prisma's misleading generic "can't reach server" message.

## Future Improvements
- Consider Supabase's connection pooling limits if traffic ever scales
  meaningfully beyond a single Railway instance