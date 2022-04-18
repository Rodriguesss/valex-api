import * as errorType from '../utils/errorTypes.utils';
import * as rechargeRepository from '../repositories/rechargeRepository';

export async function checkRechargeAmountIsValidAndAmountPersists(cardId: number, rechargeAmount: number) {
  if (rechargeAmount <= 0) {
    throw errorType.unprocessableEntity('O valor informado é igual ou menor que zero.');
  }

  const rechargeData = {
    cardId,
    amount: rechargeAmount
  }

  rechargeRepository.insert(rechargeData);
}

export async function findRecharges(cardId: number) {
  return await rechargeRepository.findByCardId(cardId);
}
