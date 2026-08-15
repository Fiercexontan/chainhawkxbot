import { getWalletForUser, getDecryptedPrivateKey } from '../wallets/wallet.service.js';
import { getChainAdapter } from './registry.js';

export async function sendFromUserWallet(
  userId: string,
  to: string,
  amountEth: string,
  chainId?: string
): Promise<string> {
  const wallet = await getWalletForUser(userId);
  if (!wallet) {
    throw new Error('User has no wallet');
  }

  const adapter = getChainAdapter(chainId);
  const privateKey = await getDecryptedPrivateKey(userId);
  return adapter.sendTransaction({ privateKey, to, amountEth });
}