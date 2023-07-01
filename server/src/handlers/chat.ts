import type { RequestHandler } from 'express';

import { sendMessage, getMessages } from '../controllers/chat';

interface SendMessageReqBody {
  content: string;
}

export const sendMessageHandler: RequestHandler<
  {},
  Awaited<ReturnType<typeof sendMessage>>,
  SendMessageReqBody
> = async (req, res, next) => {
  try {
    const { content } = req.body;

    const messages = await sendMessage(content, req.apiKey!);

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const getMessagesHandler: RequestHandler<
  {},
  Awaited<ReturnType<typeof getMessages>>
> = async (req, res, next) => {
  try {
    const messages = await getMessages(req.apiKey!);

    res.json(messages);
  } catch (error) {
    next(error);
  }
};
