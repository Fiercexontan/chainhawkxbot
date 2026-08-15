# Phase 5 — Multi-Chain Support

## Problem
Handlers hardcoded to Sepolia meant every new chain would mean editing
`/balance` and `/send` directly - exactly the kind of coupling the
`ChainAdapter` interface was designed to prevent.

## Approach
A registry (`registry.ts`) mapping a chain identifier string to its
adapter, with Sepolia as the default so nothing breaks for existing
usage. Handlers ask the registry for an adapter; they never import a
specific chain file directly.

## Architecture
Adding BSC Testnet required exactly one new file (`bsc-testnet.chain.ts`)
and one registry entry. The interface gained two fields
(`nativeCurrencySymbol`, `getExplorerTxUrl`) so handlers could stay
chain-agnostic even for display formatting, not just balance/send logic.

## Implementation
- `getChainAdapter(chainId?)` - defaults to Sepolia, throws on unknown chains
- `/balance bsc` and `/send <addr> <amount> bsc` - optional trailing chain argument

## Lessons Learned
The second chain adapter took a fraction of the effort the first one did
- three changed lines out of ~40. That's the actual, measurable payoff of
designing the interface before any chain existed, back in Phase 0.

Displaying a raw formatEther() output isn't production-ready - full
precision reads as noisy, not trustworthy, in a user-facing balance.

## Future Improvements
- Let users set a default chain preference instead of typing it each time
- Flow EVM as the third adapter, proving the pattern generalizes further