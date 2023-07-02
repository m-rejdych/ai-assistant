import { Router } from 'express';

import { validateApiKeyFromAuthHeader } from '../middleware/auth';
import { addContextMessageHandler } from '../handlers/context';

export const router = Router();

router.post('/add-context-message', validateApiKeyFromAuthHeader, addContextMessageHandler);
