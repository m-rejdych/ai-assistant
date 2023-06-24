import type { RequestHandler } from 'express';

import {
  generateApiKey,
  saveApiKey,
  validateApiKey,
} from '../controllers/auth';
import { getApiKeyFromAuthorization } from '../util/auth';

interface GenerateApiKeyResponse {
  apiKey: string;
}

interface ValidateApiKeyResponse {
  isValid: boolean;
}

export const generateApiKeyHandler: RequestHandler<
  {},
  GenerateApiKeyResponse
> = async (_, res, next) => {
  try {
    const apiKey = await generateApiKey();

    await saveApiKey(apiKey);

    res.json({ apiKey });
  } catch (error) {
    next(error);
  }
};

export const validateApiKeyHandler: RequestHandler<
  {},
  ValidateApiKeyResponse
> = async (req, res, next) => {
  try {
    const { authorization } = req.headers;

    if (!authorization) {
      res.json({ isValid: false });
      return;
    }

    const apiKey = getApiKeyFromAuthorization(authorization);

    if (!apiKey) {
      res.json({ isValid: false });
      return;
    }

    const isValid = await validateApiKey(apiKey);

    res.json({ isValid });
  } catch (error) {
    next(error);
  }
};
