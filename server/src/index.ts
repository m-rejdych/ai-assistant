import express from 'express';
import { config } from 'dotenv';

import { router as authRouter } from './routers/auth';

config();

const app = express();

app.use('/auth', authRouter);

app.listen(8080, () => console.log(`Server is running on localhost:8080`));
