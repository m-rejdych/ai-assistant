import { Router } from 'express';

import { validateApiKeyFromAuthHeader } from '../middleware/auth';
import { generateSummaryHandler } from '../handlers/util';

export const router = Router();

router.post('/generate-summary', validateApiKeyFromAuthHeader, generateSummaryHandler);
