import * as errorType from '../utils/errorTypes.utils';
import * as paymentRepository from '../repositories/paymentRepository';

export async function persistPayment(cardId: number, businessId: number, amount: number) {
  const paymentData = { cardId, businessId, amount };

  await paymentRepository.insert(paymentData);
}

export async function findPayments(cardId: number) {
  return await paymentRepository.findByCardId(cardId);
}

export function checkIfHaveEnoughBalance(balance: number, amount: number) {
  console.log(balance);
  if (amount > balance) {
    throw errorType.conflict('Você não possui saldo para essa operação.');
  }
}