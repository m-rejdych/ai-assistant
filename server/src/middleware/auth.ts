import type { RequestHandler } from 'express';

import { getApiKeyFromAuthorization } from '../util/auth';
import { validateApiKey } from '../controllers/auth';
import { StatusError } from '../models/StatusError';

export const validateApiKeyFromAuthHeader: RequestHandler = async (
  req,
  _,
  next,
) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new StatusError('Not authorized', 401);
    }

    const apiKey = getApiKeyFromAuthorization(authorization);

    if (!apiKey) {
      throw new StatusError('Not authorized', 401);
    }

    const isValid = await validateApiKey(apiKey);

    if (!isValid) {
      throw new StatusError('Not authorized', 401);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateSecretKeyFromAuthHeader: RequestHandler = (
  req,
  _,
  next,
) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      throw new StatusError('Not authorized', 401);
    }

    const apiKey = getApiKeyFromAuthorization(authorization);

    if (!apiKey) {
      throw new StatusError('Not authorized', 401);
    }

    const isValid = apiKey === process.env.SECRET_KEY;

    if (!isValid) {
      throw new StatusError('Not authorized', 401);
    }

    next();
  } catch (error) {
    next(error);
  }
};
