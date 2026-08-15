# Phase 4 — Sending Transactions

## Problem
A wallet that can only receive and report balance is read-only. Real
utility means the bot can move value on the user's behalf.

## Approach
Extended the existing `ChainAdapter` interface with `sendTransaction`,
rather than creating a separate sending mechanism - Sepolia's
implementation now handles both reading and writing chain state through
one consistent contract.

## Architecture
`transaction.service.ts` is a thin orchestration layer: it fetches the
wallet, decrypts the key for the shortest possible scope, and hands off
to the chain adapter to sign and broadcast. The private key is decrypted
in `wallet.service.ts`, used immediately in `sepolia.chain.ts`, and never
persisted or logged at any point in between.

## Implementation
- Input validation (address format, positive amount) happens before any
  database or blockchain call - fail cheap, fail fast
- Errors from the blockchain call are caught explicitly and reported
  honestly - the bot tells the user to verify via /balance rather than
  claiming certainty it doesn't have about whether a failed call still
  landed on-chain

## Lessons Learned
Testing via a self-transfer first (send to the same address) proved
signing and broadcasting worked with zero risk of losing test funds to a
typo, before testing against a genuinely different address.

## Future Improvements
- Add a confirmation step for large amounts before broadcasting
- Show estimated gas fee before sending, not just after
- Retry/status-check logic for transactions stuck pending