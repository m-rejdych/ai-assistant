import { Router } from 'express';

import {
  sendMessageHandler,
  getMessagesByChatIdHandler,
  getActiveChatHandler,
  getChatsHandler,
  deleteChatByIdHandler,
} from '../handlers/chat';

export const router = Router();

router.post('/send-message', sendMessageHandler);

router.get('/get-messages-by-chat-id', getMessagesByChatIdHandler);

router.get('/get-active-chat', getActiveChatHandler);

router.get('/get-chats', getChatsHandler);

router.delete('/delete-chat-by-id', deleteChatByIdHandler);
