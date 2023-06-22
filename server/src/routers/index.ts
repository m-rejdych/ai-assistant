import { Router } from 'express';

export const router = Router();

router.get('/hello', (_, res) => {
  res.json({ message: 'hello there' });
});
