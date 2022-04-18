import { Router } from 'express';
import * as cardController from '../controllers/card.controller';

const cardRouter = Router();

cardRouter.post('/', cardController.createCard);
cardRouter.post('/active', cardController.activateCard);

export default cardRouter;