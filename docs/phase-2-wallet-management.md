# Phase 2 — Wallet Management

## Problem
Users need an actual on-chain identity - an address and, custodially, a
private key - not just a Telegram-linked account.

## Approach
viem for key generation and address derivation (TypeScript-first, the
current recommendation for backend Node.js work over ethers.js v6).
AES-256-GCM via Node's built-in `crypto` for encryption at rest, keyed by
`ENCRYPTION_SECRET` - no third-party service ever holds a key.

## Architecture
Wallet Management (`src/wallets/wallet.service.ts`) sits on top of two
things: Security (`src/security/encryption.ts`) for at-rest protection,
and the Database Layer for persistence. Because every target chain
(Sepolia, BSC Testnet, Flow EVM) is EVM-compatible, one wallet per user is
enough - the same address and key work everywhere. `userId` is `@unique`
on the `Wallet` model, enforced at the database level, not just checked
in application code.

## Implementation
- `createWalletForUser()` - generates a key, derives the address,
  encrypts, persists; the raw key exists only for the function's
  duration, never returned, never logged
- `getWalletForUser()` - existence check before create, since a second
  create attempt would hit the unique constraint and crash
- `/wallet` command - create-or-show pattern, same shape as the `/start`
  upsert logic from Phase 1

## Lessons Learned
Ciphertext isn't sensitive - only plaintext and the encryption key are.
Worth keeping that distinction explicit, since over-cautious handling of
genuinely non-secret data is its own kind of mistake.

VS Code's TS server can lag behind a freshly regenerated Prisma client -
"Restart TS Server" was needed after adding the `Wallet` model, even
though the code ran correctly the whole time via `tsx`.

## Future Improvements
- `/export` - retrieve the decrypted private key, needs deliberate
  friction (confirmation step, clear warning) given the stakes
- Support multiple wallets per user later, if ever needed (drop
  `@unique` on `userId`)