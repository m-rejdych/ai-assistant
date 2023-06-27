import type { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient;

  namespace Express {
    export interface Request {
      apiKey?: string;
    }
  }
}
