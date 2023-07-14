import type { RequestHandler } from 'express';

import {
  sendMessage,
  getMessagesByChatId,
  getActiveChatId,
  getChats,
  deleteChatById,
} from '../controllers/chat';

interface SendMessageReqBody {
  content: string;
  chatId?: string;
}

interface DeleteChatByIdQuery {
  id?: string;
}

export const sendMessageHandler: RequestHandler<
  {},
  Awaited<ReturnType<typeof sendMessage>>,
  SendMessageReqBody
> = async (req, res, next) => {
  try {
    const { content, chatId } = req.body;

    const messages = await sendMessage(content, req.apiKey!, chatId);

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const getMessagesByChatIdHandler: RequestHandler<
  {},
  Awaited<ReturnType<typeof getMessagesByChatId>>,
  never,
  { chatId: string }
> = async (req, res, next) => {
  try {
    const { chatId } = req.query;
    if (!chatId) throw new Error('"chatId" query is required');

    const messages = await getMessagesByChatId(chatId, req.apiKey!);

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const getActiveChatHandler: RequestHandler<{}, string> = async (req, res, next) => {
  try {
    const chatId = await getActiveChatId(req.apiKey!);

    res.json(chatId);
  } catch (error) {
    next(error);
  }
};

export const getChatsHandler: RequestHandler<{}, Awaited<ReturnType<typeof getChats>>> = async (
  req,
  res,
  next,
) => {
  try {
    const chats = await getChats(req.apiKey!);

    res.json(chats);
  } catch (error) {
    next(error);
  }
};

export const deleteChatByIdHandler: RequestHandler<{}, never, never, DeleteChatByIdQuery> = async (
  req,
  res,
  next,
) => {
  try {
    const { id } = req.query;
    if (!id) throw new Error('"id" query is required.');

    await deleteChatById(id, req.apiKey!);

    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
