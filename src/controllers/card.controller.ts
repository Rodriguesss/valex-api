import { Request, Response } from 'express';
import * as cardService from '../services/card.service';


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