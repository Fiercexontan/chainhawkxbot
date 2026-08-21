# Phase 12 — Going Live (Render Deployment)

## Problem
The bot only existed as a process on one laptop - dependent on that
machine being on, `npm run dev` running, and a home internet connection
staying up. Not a real, hosted product yet, regardless of how many
features it had.

## Approach
Render's free tier, reached via a genuine budget constraint (Railway's
one-time trial credit had expired, and paying wasn't an option yet).
Free-tier hosting meant confronting a real trade-off head-on: Render's
free web services sleep after 15 minutes of inactivity, which is
incompatible with Telegram long-polling's need for an always-running
process.

## Architecture
Rather than treat the sleep behavior as a blocker, the bot now supports
both connection models, branching on environment: **webhooks** in
production (Telegram pushes updates to us directly via HTTPS - no
constant polling loop needed, so the process can sleep between messages)
and **long-polling** locally (no public HTTPS domain exists on a laptop,
so polling stays the simplest option for development). The branch point
is a single optional config value, `WEBHOOK_DOMAIN` - present on Render,
absent locally - so local development behavior never changed throughout
this entire migration.

## Implementation
- `index.ts` branches on `config.webhookDomain`: webhook mode calls
  `bot.launch({ webhook: { domain, port, secretToken } })`; polling mode
  is the unchanged Phase 0 behavior
- `secretToken` lets the server verify incoming requests genuinely
  originate from Telegram, not an impersonator hitting the public URL
- Render build command explicitly chains `npm install && npx prisma
  generate && npm run build` with `&&`, not `;` - a failed step must
  stop the pipeline, not silently continue into a broken build
- Same Supabase database serves both local dev and production (the
  Phase 11 decision), so no migration step was needed in the deploy
  pipeline itself - the schema was already live

## Lessons Learned
A wallet-custody bot's secrets belong in exactly two places: the local
`.env` file, and one hosting provider's environment variable dashboard.
Random low-trust "free forever" bot-hosting services that turned up in a
quick search were deliberately ruled out for this project, regardless of
cost savings - security discipline doesn't get suspended because of a
budget constraint.

Render's environment variable fields don't automatically strip quote
characters the way `dotenv` does when parsing a local `.env` file -
pasting a quoted connection string directly caused it to fail to parse
until the quotes were manually removed.

`NODE_ENV` should genuinely differ between environments, not match -
`development` locally enables pino's pretty-printing and the
hot-reload-safe Prisma caching guard `tsx watch` needs; `production` on
Render disables both, correctly.

The real proof of a live deployment isn't a successful build log - it's
testing from a device that has zero relationship to the machine that
built it. Confirmation came from a phone, laptop fully powered off.

## Future Improvements
- Consider upgrading off the free tier once there's real, sustained
  usage - eliminates the cold-start delay after idle periods entirely
- Investigate Render's persistent disk or an external log aggregator if
  log history beyond the dashboard's retention window becomes useful