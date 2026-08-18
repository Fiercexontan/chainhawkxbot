# Phase 8 — Transaction History

## Problem
Users can send and check balances, but have no visibility into past
activity - no way to see what already happened on their wallet.

## Approach
Etherscan's V2 API - one key across 60+ chains via a `chainid` parameter,
replacing the old world of separate keys per block explorer.

## Architecture
`explorer.service.ts` sits outside the `ChainAdapter` interface
deliberately - it's a REST API integration, not an RPC call like balance
and send, so it doesn't share the interface's shape. `ChainAdapter` did
gain one new field though: `explorerChainId`, since Etherscan's numeric
chain IDs differ from our own internal string labels.

## Implementation
- Distinguishes a genuinely empty result ("No transactions found") from
  an actual API failure - conflating them would show a user "no history"
  when the truth is "we couldn't check," which is a meaningfully
  different, worse failure mode
- `/history [chain]` - same optional-chain-argument pattern as
  /balance and /send, defaults to Sepolia

## Lessons Learned
A newly created, correctly formatted Etherscan API key returned "Invalid
API Key" consistently, confirmed via direct browser requests with zero
app code involved, on two separately generated keys. Other developers
report this exact symptom as an occasional, unexplained delay on
Etherscan's infrastructure, sometimes resolving after several hours with
no changes needed. Rather than block development, the error-handling
path itself became the thing under test - and correctly surfaced a clear
error to both the user and the logs instead of failing silently. Real
external dependencies fail in ways outside your control; the measure of
good code is failing honestly when they do, and this exact scenario
proved the design first-time-live rather than in a contrived test.
Confirmed resolved after ~22 hours with zero changes on our end -
consistent with the pattern found from other developers' reports.

## Future Improvements
- Retry key validity check once resolved, confirm live data renders correctly
- Consider a lightweight cache, since transaction history doesn't need a
  fresh API call on every single request