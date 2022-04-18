import * as errorType from '../utils/errorTypes.utils';
import * as businessRepository from '../repositories/businessRepository';
import * as cardRepository from '../repositories/cardRepository';

export async function checkBusinessIsRegistered(businessId: number) {
  const response = await businessRepository.findById(businessId);

  if (!response) {
    throw errorType.notFound('Estabelecimento não esta cadastrado no sistema.');
  }
}

export async function checkIfBusinessTypeIsSameCardType(cardId: number, businessId: number) {
  const { type: cardType } = await cardRepository.findById(cardId);
  const { type: businessType } = await businessRepository.findById(businessId);

  if (cardType !== businessType) {
    throw errorType.conflict('Os tipos não coincidem.');
  }
}