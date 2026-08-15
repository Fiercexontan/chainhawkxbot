// Operates on the string directly rather than converting to a JS number,
// since floating-point math would silently lose precision on values
// this granular - a real risk when the number represents actual money.
export function formatBalance(balance: string, maxDecimals = 6): string {
  const [whole, decimals = ''] = balance.split('.');
  if (!decimals) return whole;
  const trimmed = decimals.slice(0, maxDecimals).replace(/0+$/, '');
  return trimmed ? `${whole}.${trimmed}` : whole;
}