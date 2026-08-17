# Phase 7 — Wallet Export

## Problem
Users need a way to retrieve their raw private key for use outside the
bot - but this is the single highest-stakes action in the whole system,
since a private key has no revoke mechanism, unlike a compromised token.

## Approach
A two-step confirmation flow using Telegram inline buttons, not an
instant reveal on command. The key is sent as its own message, separate
from the warning text, and scheduled to auto-delete from the chat 60
seconds after being shown.

## Architecture
`export.handler.ts` registers both the `/export` command and the two
button actions (`confirm_export`, `cancel_export`) it triggers. Decryption
happens only inside the confirm branch, at the last possible moment -
never speculatively, never before the user has explicitly opted in twice
(command, then button tap).

## Implementation
- Warning copy states the risk in concrete terms (irreversible, full
  control) rather than a generic disclaimer
- `setTimeout` + `ctx.telegram.deleteMessage()` for auto-deletion,
  wrapped in its own try/catch so a failed delete doesn't crash anything
- Every export attempt is logged at `warn` level, not `info` - this
  action deserves more visibility in logs than a routine balance check

## Lessons Learned
During testing, a real exported private key was pasted directly into
this build conversation to confirm the feature worked. Unlike the earlier
`BOT_TOKEN` exposure, a private key has no revoke path - a bot token can
be reissued through BotFather with the old one instantly invalidated, but
a private key is permanently, mathematically bound to its address the
moment it's generated. The wallet was abandoned on principle and a fresh
one generated, even though it only ever held worthless testnet funds.
Rule going forward: confirming a secret-revealing feature works never
requires seeing the actual secret - "it matched the expected format" is
always sufficient.

## Future Improvements
- Rate-limit /export attempts per user (e.g. max 1 per 10 minutes) to
  reduce the blast radius of a compromised Telegram account