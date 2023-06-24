import { Router } from 'express';

import { generateApiKeyHandler, validateApiKeyHandler } from '../handlers/auth';

export const router = Router();

router.put(process.env.GENERATE_API_KEY_ENDPOINT as string, generateApiKeyHandler);

router.get('/validate-api-key', validateApiKeyHandler);
