import { randomUUID } from 'crypto';

import { prisma } from '../util/prisma';
import { sha256 } from '../util/auth';

export const generateApiKey = async (): Promise<string> => {
  const apiKey = randomUUID();

  return apiKey;
};

export const saveApiKey = async (apiKey: string): Promise<void> => {
  const hashedApiKey = sha256(apiKey);

  await prisma.apiKey.create({ data: { key: hashedApiKey } });
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  const hashedApiKey = sha256(apiKey);

  const matchedApiKey = await prisma.apiKey.findUnique({
    where: { key: hashedApiKey },
  });

  return !!matchedApiKey;
};
