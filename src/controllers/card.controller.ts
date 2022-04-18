import { Request, Response } from 'express';
import * as cardService from '../services/card.service';
import * as rechargeService from '../services/recharge.service';
import * as businessService from '../services/business.service';
import * as paymentService from '../services/payment.service';

export async function createCard(req: Request, res: Response) {
  const { type, employeeId } = req.body;

  const apiKey: string = req.headers['x-api-key'] as string;

  await cardService.validateApiKey(apiKey);

  cardService.validateCardType(type);

  const cardData = await cardService.checkDataInRequestBodyIsValidAnsAssemblesCardObject(type, employeeId);

  const cardSecurityCode = cardService.generateCardSecurityCode();

  const encryptedSecurityCode = cardService.generateEncryptedCardSecurityCode(cardSecurityCode);

  await cardService.createCard({ ...cardData, securityCode: encryptedSecurityCode });

  return res.status(201).send({ cardSecurityCode });
}

export async function activateCard(req: Request, res: Response) {
  const { cardId, userSecurityCode, cardPassword } = req.body;

  const card = await cardService.checkCardIsRegistered(cardId);

  const { expirationDate, isVirtual, password, securityCode: cardSecurityCode } = card;

  cardService.checkExpirationDate(expirationDate);

  cardService.checkCardIsActivatedAndHasPassword(isVirtual, password as string);

  cardService.checkCardSecurityCode(userSecurityCode, cardSecurityCode);

  const encryptedCardPassword = cardService.checkPasswordHasFourNumericDigitsAndGenerateEncryptedCardPassword(cardPassword);

  cardService.cardActive(cardId, card, encryptedCardPassword);

  return res.sendStatus(200);
}

export async function balanceAndTransactions(req: Request, res: Response) {
  const { cardId } = req.body;

  await cardService.checkCardIsRegistered(cardId);

  const { balance, transactions, recharges } = await cardService.getBalance(cardId);

  return res.status(200).send({ balance, transactions, recharges });
}

export async function recharge(req: Request, res: Response) {
  const { cardId, rechargeAmount } = req.body;

  const apiKey: string = req.headers['x-api-key'] as string;

  await cardService.validateApiKey(apiKey);

  const card = await cardService.checkCardIsRegistered(cardId);

  cardService.checkExpirationDate(card.expirationDate);

  await rechargeService.checkRechargeAmountIsValidAndAmountPersists(cardId, rechargeAmount);

  return res.sendStatus(201);
}

export async function payment(req: Request, res: Response) {
  const { cardId, cardPassword, businessId, amount } = req.body;

  const card = await cardService.checkCardIsRegistered(cardId);

  cardService.checkExpirationDate(card.expirationDate);

  cardService.checkCardPasswordIsValid(cardPassword, card.password as string);

  await businessService.checkBusinessIsRegistered(businessId);

  await businessService.checkIfBusinessTypeIsSameCardType(cardId, businessId);

  const { balance } = await cardService.getBalance(cardId);

  paymentService.checkIfHaveEnoughBalance(balance, amount);

  await paymentService.persistPayment(cardId, businessId, amount);

  return res.sendStatus(201);
}
