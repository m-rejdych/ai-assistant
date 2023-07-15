import type { RequestHandler } from 'express';

import {
  addUserContextMessage,
  addAssistantContextMessage,
  deleteUserContext,
  deleteAssistantContext,
} from '../controllers/context';

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

export const deleteUserContextHandler: RequestHandler = async (req, res, next) => {
  try {
    await deleteUserContext(req.apiKey!);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};

export const deleteAssistantContextHandler: RequestHandler = async (req, res, next) => {
  try {
    await deleteAssistantContext(req.apiKey!);
    res.sendStatus(200);
  } catch (error) {
    next(error);
  }
};
