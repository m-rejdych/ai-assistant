import type { RequestHandler } from 'express';

import { generateSummary } from '../controllers/util';

interface GenerateSummaryResBody {
  summary: string;
}

interface GenerateSummaryReqBody {
  url: string;
}

export const generateSummaryHandler: RequestHandler<{}, GenerateSummaryResBody, GenerateSummaryReqBody> = async (req, res, next) => {
  try {
    const summary = await generateSummary(req.body.url);

    res.json({ summary });
  } catch (error) {
    next(error);
  }
};
