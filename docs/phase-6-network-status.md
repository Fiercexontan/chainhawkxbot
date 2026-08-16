# Phase 6 — Network Status

## Problem
Users have no visibility into whether a chain is congested, slow, or
down before sending a transaction.

## Approach
Extended `ChainAdapter` once more with `getNetworkStatus()`, reusing the
same public clients already created for balance checks - no new
connections, just new queries against existing infrastructure.

## Architecture
`/status` queries every registered chain in parallel via
`Promise.all`, with each chain wrapped in its own try/catch - one RPC
being slow or unreachable degrades gracefully instead of failing the
whole command.

## Lessons Learned
`getAllChainAdapters()` needed explicit de-duplication, since the
registry intentionally maps multiple aliases ('bsc' and 'bsc-testnet')
to the same adapter for command flexibility - a naive `Object.values()`
would have shown BSC Testnet twice.

## Future Improvements
- Cache status briefly (10-15s) since gas price/block number don't need
  a fresh RPC call on every single request