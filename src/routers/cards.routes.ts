import { Router } from 'express';
import * as cardController from '../controllers/card.controller';

const cardRouter = Router();

cardRouter.post('/', cardController.createCard);
cardRouter.put('/active', cardController.activateCard);
cardRouter.get('/balance-transactions', cardController.balanceAndTransactions);
cardRouter.post('/recharge', cardController.recharge);
cardRouter.post('/payment', cardController.payment);

export default cardRouter;