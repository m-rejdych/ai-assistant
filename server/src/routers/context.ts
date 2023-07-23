import { Router } from 'express';

import { validateApiKeyFromAuthHeader } from '../middleware/auth';
import {
  addUserContextMessageHandler,
  addAssistantContextMessageHandler,
  deleteUserContextHandler,
  deleteAssistantContextHandler,
} from '../handlers/context';

export const router = Router();

router.post('/add-user-context-message', addUserContextMessageHandler);

router.post('/add-assistant-context-message', addAssistantContextMessageHandler);

router.delete('/delete-user-context', validateApiKeyFromAuthHeader, deleteUserContextHandler);

router.delete('/delete-assistant-context', deleteAssistantContextHandler);
