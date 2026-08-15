import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { prisma } from '../database/db.js';
import { encrypt } from '../security/encryption.js';
// removed unused PrismaClient import (not exported by @prisma/client in this project)
import { decrypt } from '../security/encryption.js';

export async function getDecryptedPrivateKey(userId: string): Promise<string> {
  const wallet = await (prisma as any).wallet.findUniqueOrThrow({ where: { userId } });
  // Decrypted only for the moment it's needed to sign. Never logged,
  // never returned beyond this call chain. JS can't guarantee this string
  // is wiped from memory the instant we're done with it - that's a real
  // limitation of the language, not something to pretend isn't true - but
  // keeping its scope this narrow is the best practical mitigation available.
  return decrypt(wallet.encryptedPrivateKey);
}


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
