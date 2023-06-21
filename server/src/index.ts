import express from 'express';
import { createExpressMiddleware } from '@trpc/server/adapters/express';

import { appRouter } from './routers';
import { createContext } from './utils/trpc/context';

const app = express();

app.use('/trpc', createExpressMiddleware({ router: appRouter, createContext }));

app.listen(8080, () => console.log(`Server is running on localhost:8080`));
