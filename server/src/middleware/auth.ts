import type { RequestHandler } from 'express';

import { getApiKeyFromAuthorization, sha256 } from '../util/auth';
import { prisma } from '../util/prisma';
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

    const hashedKey = sha256(apiKey);
    const matchedKey = await prisma.apiKey.findUnique({
      where: { key: hashedKey },
    });

    if (!matchedKey) {
      throw new StatusError('Not authorized', 401);
    }

    req.apiKey = matchedKey.key;

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
