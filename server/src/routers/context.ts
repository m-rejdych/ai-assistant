import { Router } from 'express';

import { validateApiKeyFromAuthHeader } from '../middleware/auth';
import {
  addUserContextMessageHandler,
  addAssistantContextMessageHandler,
  deleteUserContextHandler,
  deleteAssistantContextHandler,
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

router.delete('/delete-user-context', validateApiKeyFromAuthHeader, deleteUserContextHandler);

router.delete(
  '/delete-assistant-context',
  validateApiKeyFromAuthHeader,
  deleteAssistantContextHandler,
);
