/**
 * Every supported chain implements this contract.
 *
 * This exists now, in Phase 0, even though no chain is implemented yet.
 * The point: multi-chain support is a design decision made once, here -
 * not something we retrofit after Sepolia is already hardcoded into
 * command handlers. Phase 3/4 will add concrete adapters (SepoliaAdapter,
 * BscTestnetAdapter, ...) that implement this interface one at a time.
 */
export interface ChainAdapter {
  readonly chainId: string; // e.g. 'sepolia', 'bsc-testnet'
  readonly displayName: string;

  getBalance(address: string): Promise<string>;
  // more methods land as we build Phase 3/4:
  // sendTransaction(...), getTransactionStatus(...), estimateGas(...)
  sendTransaction(params: {
    privateKey: string;
    to: string;
    amountEth: string;
  }): Promise<string>; // returns the transaction hash
}
