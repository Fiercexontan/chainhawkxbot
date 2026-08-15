import { getWalletForUser, getDecryptedPrivateKey } from '../wallets/wallet.service.js';
import { sepoliaAdapter } from './chains/sepolia.chain.js';

export async function sendFromUserWallet(
  userId: string,
  to: string,
  amountEth: string
): Promise<string> {
  const wallet = await getWalletForUser(userId);
  if (!wallet) {
    throw new Error('User has no wallet');
  }

  const privateKey = await getDecryptedPrivateKey(userId);
  return sepoliaAdapter.sendTransaction({ privateKey, to, amountEth });
}