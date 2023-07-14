import type { RequestHandler } from 'express';

import { addUserContextMessage, addAssistantContextMessage } from '../controllers/context';

interface AddContextMessageReqBody {
  content: string;
}

export const addUserContextMessageHandler: RequestHandler<
  {},
  never,
  AddContextMessageReqBody
> = async (req, res, next) => {
  try {
    await addUserContextMessage(req.body.content, req.apiKey!);

    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};

export const addAssistantContextMessageHandler: RequestHandler<
  {},
  never,
  AddContextMessageReqBody
> = async (req, res, next) => {
  try {
    await addAssistantContextMessage(req.body.content, req.apiKey!);

    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};
