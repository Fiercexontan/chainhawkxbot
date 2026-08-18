# Phase 10 — Portfolio Insights

## Problem
Users could check one chain at a time, but had no single view of what
they actually hold across the whole wallet - exactly the shift from
"utility" to "assistant" the original project vision called for.

## Approach
CoinGecko's free Demo API for USD pricing, aggregated against balances
fetched in parallel from every registered chain via `getAllChainAdapters()`.

## Architecture
`portfolio.service.ts` is the first module in the project that genuinely
operates across all chains simultaneously, rather than accepting one
chain as a parameter. `ChainAdapter` gained one more field
(`coingeckoId`) - a fourth piece of chain-specific metadata living on the
adapter, alongside `nativeCurrencySymbol`, `explorerChainId`, and
`getExplorerTxUrl`.

## Implementation
- Balance fetches run via `Promise.all`, each independently wrapped so
  one chain's RPC failure doesn't block the others
- A failed balance fetch stores `null`, not `'0'` - a real zero balance
  and "we couldn't check" are different situations and the user sees
  the difference (⚠️ vs an actual $0.00)
- Price fetch failure degrades the whole command to "balances without
  USD values" rather than failing entirely - partial information beats
  none

## Lessons Learned
This phase needed zero new balance-fetching code - it's entirely
composed from `getAllChainAdapters()` (built in Phase 6) and
`getBalance()` (built in Phase 3/5). The architecture work from earlier
phases is what made this a composition exercise instead of a build.

## Future Improvements
- Cache prices briefly (60s) - portfolio value doesn't need a fresh
  CoinGecko call on every single request
- Show percentage allocation across chains, not just totals