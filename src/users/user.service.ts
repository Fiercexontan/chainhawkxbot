import { prisma } from '../database/db.js';

interface TelegramUserInfo {
  telegramId: number;
  username?: string;
  firstName?: string;
}

export async function upsertUser(info: TelegramUserInfo) {
  return prisma.user.upsert({
    where: { telegramId: BigInt(info.telegramId) },
    update: {
      username: info.username,
      firstName: info.firstName,
    },
    create: {
      telegramId: BigInt(info.telegramId),
      username: info.username,
      firstName: info.firstName,
    },
  });
}