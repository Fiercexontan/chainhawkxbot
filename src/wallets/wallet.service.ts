import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { prisma } from '../database/db.js';
import { encrypt } from '../security/encryption.js';
// removed unused PrismaClient import (not exported by @prisma/client in this project)

export async function createWalletForUser(userId: string) {
  const privateKey = generatePrivateKey();
  const account = privateKeyToAccount(privateKey);

  const wallet = await (prisma as any).wallet.create({
    data: {
      userId,
      address: account.address,
      encryptedPrivateKey: encrypt(privateKey),
    },
  });

  return wallet;
}

export async function getWalletForUser(userId: string) {
  return (prisma as any).wallet.findUnique({ where: { userId } });
}