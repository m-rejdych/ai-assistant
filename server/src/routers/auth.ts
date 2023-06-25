import { Router } from 'express';

import { generateApiKeyHandler, validateApiKeyHandler } from '../handlers/auth';
import { validateSecretKeyFromAuthHeader } from '../middleware/auth';

export const router = Router();

router.put(
  process.env.GENERATE_API_KEY_ENDPOINT as string,
  validateSecretKeyFromAuthHeader,
  generateApiKeyHandler,
);

router.get('/validate-api-key', validateApiKeyHandler);
