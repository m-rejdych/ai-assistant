import express from 'express';
import { config } from 'dotenv';

import { router as authRouter } from './routers/auth';
import { router as chatRouter } from './routers/chat';
import { router as contextRouter } from './routers/context';
import { errorMiddleware } from './middleware/error';

config();

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/auth', authRouter);
app.use('/chat', chatRouter);
app.use('/context', contextRouter);
app.use(errorMiddleware);

app.listen(8080, () => console.log(`Server is running on localhost:8080`));
