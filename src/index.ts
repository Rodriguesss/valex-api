import express, { json } from 'express';
import "dotenv/config";
import "express-async-errors";
import cors from 'cors';
import { routers } from './routers/index.routes';
import { errorHandler } from './middlewares/errorHandle.middleware';

const app = express();

app.use(cors());
app.use(json());
app.use('/api', routers);
app.use(errorHandler);

export default app;
