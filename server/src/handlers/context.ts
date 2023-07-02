import type { RequestHandler } from 'express';

import { addContextMessage } from '../controllers/context';

interface AddContextMessageReqBody {
  content: string;
}

export const addContextMessageHandler: RequestHandler<
  {},
  never,
  AddContextMessageReqBody
> = async (req, res, next) => {
  try {
    await addContextMessage(req.body.content, req.apiKey!);

    res.sendStatus(201);
  } catch (error) {
    next(error);
  }
};
