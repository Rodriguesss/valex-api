import { Router } from 'express';
import { cardController } from '../controllers/card.controller';

const cardRouter = Router();

cardRouter.post('/cards', cardController.createCard);

export default cardRouter;