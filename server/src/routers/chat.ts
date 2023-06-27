import { Router } from 'express';

import { validateApiKeyFromAuthHeader } from '../middleware/auth';
import { sendMessageHandler } from '../handlers/chat';

export const router = Router();

router.post('/send-message', validateApiKeyFromAuthHeader, sendMessageHandler);
