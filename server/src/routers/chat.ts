import { Router } from 'express';

import { validateApiKeyFromAuthHeader } from '../middleware/auth';
import {
  sendMessageHandler,
  getMessagesByChatIdHandler,
  getActiveChatHandler,
  getChatsHandler,
  deleteChatByIdHandler,
} from '../handlers/chat';

export const router = Router();

router.post('/send-message', validateApiKeyFromAuthHeader, sendMessageHandler);

router.get('/get-messages-by-chat-id', validateApiKeyFromAuthHeader, getMessagesByChatIdHandler);

router.get('/get-active-chat', validateApiKeyFromAuthHeader, getActiveChatHandler);

router.get('/get-chats', validateApiKeyFromAuthHeader, getChatsHandler);

router.delete('/delete-chat-by-id', validateApiKeyFromAuthHeader, deleteChatByIdHandler);
