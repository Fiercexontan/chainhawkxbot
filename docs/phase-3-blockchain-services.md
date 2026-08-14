# Phase 3 — Blockchain Services

## Problem
A stored wallet address is inert without a way to query real on-chain
state. Users need to see their actual balance, not just hold an address.

## Approach
viem's `createPublicClient` against a public Sepolia RPC endpoint - no
API key needed for read-only queries like balance checks.

## Architecture
This is the first real payoff of the `ChainAdapter` interface designed
back in Phase 0. `sepolia.chain.ts` is the only file that knows Sepolia
specifics (RPC transport, chain config); `balance.handler.ts` only ever
calls `sepoliaAdapter.getBalance()` through the interface. Adding BSC
Testnet or Flow EVM later means writing one new adapter file - the
handler and command layer don't change.

## Implementation
- `sepolia.chain.ts` - implements `ChainAdapter`, wraps viem's public
  client, converts wei to a human-readable ETH string via `formatEther`
- `/balance` - fetches the user's wallet, guards against "no wallet yet",
  sends an interim "checking..." message since RPC calls aren't instant

## Lessons Learned
Testing the RPC call in isolation (`test-balance.ts`) before wiring it
into Telegram meant the only thing left to debug when adding the handler
was Telegram-specific code - the blockchain logic was already proven.

## Future Improvements
- Cache balance briefly to avoid hammering the RPC on repeated /balance calls
- Add BSC Testnet and Flow EVM adapters, both implementing the same interface