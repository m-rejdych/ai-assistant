import { randomUUID, createHash } from 'crypto';

import { prisma } from '../util/prisma';

export const generateApiKey = async (): Promise<string> => {
  const apiKey = randomUUID();

  return apiKey;
};

export const saveApiKey = async (apiKey: string): Promise<void> => {
  const hashedApiKey = createHash('sha256').update(apiKey).digest('hex');

  await prisma.apiKey.create({ data: { key: hashedApiKey } });
};

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  const hashedApiKey = createHash('sha256').update(apiKey).digest('hex');

  const matchedApiKey = await prisma.apiKey.findUnique({
    where: { key: hashedApiKey },
  });

  return !!matchedApiKey;
};
