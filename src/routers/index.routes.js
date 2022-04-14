import { Router } from 'express';
import cardRouter from './cards.routes';

const indexRouter = Router();

indexRouter.use('/api');
indexRouter.use('/companies', cardRouter);

export default indexRouter;