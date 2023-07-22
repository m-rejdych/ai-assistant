import express from 'express';
import { config } from 'dotenv';

import { router as authRouter } from './routers/auth';
import { router as chatRouter } from './routers/chat';
import { router as contextRouter } from './routers/context';
import { router as utilRouter } from './routers/util';
import { errorMiddleware } from './middleware/error';

config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/chat', chatRouter);
app.use('/context', contextRouter);
app.use('/util', utilRouter);
app.use(errorMiddleware);

app.listen(parseInt(process.env.PORT as string), process.env.HOST as string, () =>
  console.log(`Server is running.`),
);
