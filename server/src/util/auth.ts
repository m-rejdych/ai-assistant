export const getApiKeyFromAuthorization = (authorizationHeader: string): string | null => {
  if (!/Bearer .+/.test(authorizationHeader)) return null;

  const apiKey = authorizationHeader.split(' ')[1];

  return apiKey;
};
