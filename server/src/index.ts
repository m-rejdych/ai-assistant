import express from 'express';

import { router } from './routers';

const app = express();

app.use(router);

app.listen(8080, () => console.log(`Server is running on localhost:8080`));
