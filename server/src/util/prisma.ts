import { PrismaClient } from '@prisma/client';

interface Global {
  prisma: PrismaClient;
}

export const prisma = (global as unknown as Global).prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') (global as unknown as Global).prisma = prisma;
