import { Router } from 'express';

import { generateSummaryHandler } from '../handlers/notion';

export const router = Router();

router.post('/generate-summary', generateSummaryHandler);
