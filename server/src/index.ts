import express from 'express';
import { config } from 'dotenv';

import { router as authRouter } from './routers/auth';
import { router as chatRouter } from './routers/chat';
import { router as contextRouter } from './routers/context';
import { router as notionRouter } from './routers/notion';
import { errorMiddleware } from './middleware/error';
import {
  validateApiKeyFromAuthHeader,
  validateNotionApiKey,
} from './middleware/auth';

config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/chat', validateApiKeyFromAuthHeader, chatRouter);
app.use('/context', validateApiKeyFromAuthHeader, contextRouter);
app.use('/notion', validateApiKeyFromAuthHeader, validateNotionApiKey, notionRouter);
app.use(errorMiddleware);

app.listen(parseInt(process.env.PORT as string), process.env.HOST as string, () =>
  console.log(`Server is running.`),
);
