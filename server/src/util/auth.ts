import { createHash } from 'crypto';

export const getApiKeyFromAuthorization = (
  authorizationHeader: string,
): string | null => {
  if (!/Bearer .+/.test(authorizationHeader)) return null;

  const apiKey = authorizationHeader.split(' ')[1];

  return apiKey;
};

export const sha256 = (key: string): string =>
  createHash('sha256').update(key).digest('hex');
