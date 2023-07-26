import type { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (error, _, res, __) => {
  const status = error.status ?? 500;
  const errorData = { status, message: error.message };
  console.log(`ERROR: `, errorData);

  res.status(status).json(errorData);
};
