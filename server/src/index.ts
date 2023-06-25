import express from 'express';
import { config } from 'dotenv';

import { router as authRouter } from './routers/auth';
import { errorMiddleware } from './middleware/error';

config();

const app = express();

app.use('/auth', authRouter);
app.use(errorMiddleware);

app.listen(8080, () => console.log(`Server is running on localhost:8080`));
