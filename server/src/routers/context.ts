import { Router } from 'express';

import { validateApiKeyFromAuthHeader } from '../middleware/auth';
import {
  addUserContextMessageHandler,
  addAssistantContextMessageHandler,
} from '../handlers/context';

export const router = Router();

router.post(
  '/add-user-context-message',
  validateApiKeyFromAuthHeader,
  addUserContextMessageHandler,
);

router.post(
  '/add-assistant-context-message',
  validateApiKeyFromAuthHeader,
  addAssistantContextMessageHandler,
);
