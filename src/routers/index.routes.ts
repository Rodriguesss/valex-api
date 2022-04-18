import { Router } from 'express';
import cardRouter from './cards.routes';

const routers = Router();

routers.use('/cards', cardRouter);

export { routers };