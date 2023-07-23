import type { RequestHandler } from 'express';

import { generateSummary } from '../controllers/notion';

interface GenerateSummaryResBody {
  summary: string;
}

interface GenerateSummaryReqBody {
  url: string;
  databaseId: string;
}

export const generateSummaryHandler: RequestHandler<
  {},
  GenerateSummaryResBody,
  GenerateSummaryReqBody
> = async (req, res, next) => {
  try {
    const { url, databaseId } = req.body;
    const summary = await generateSummary(url, databaseId, req.notionApiKey!);

    res.json({ summary });
  } catch (error) {
    next(error);
  }
};
