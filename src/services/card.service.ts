import * as errorType from '../utils/errorTypes.utils';
import * as companyRepository from '../repositories/companyRepository';
import * as cardRepository from '../repositories/cardRepository';
import * as employeeRepository from '../repositories/employeeRepository';
import * as paymentService from './payment.service';
import * as rechargeService from './recharge.service';
import { TransactionTypes, CardInsertData, CardUpdateData } from '../repositories/cardRepository';
import { faker } from '@faker-js/faker';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';

const regexMasterCard = /^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/;

export function validateCardType(type: string) {
  const arrayType = ['groceries', 'restaurants', 'transport', 'education', 'health'];

  const validType = arrayType.includes(type);

  if (!validType) {
    throw errorType.unprocessableEntity('Tipo do cartão informado não é válido.');
  }
}

export async function validateApiKey(apiKey: string) {
  const response = await companyRepository.findByApiKey(apiKey)

  if (!response) {
    throw errorType.notFound('Chave de API inválida.');
  }
}

async function checkEmployeeHasCardSameType(type: TransactionTypes, employeeId: number) {
  const response = await cardRepository.findByTypeAndEmployeeId(type, employeeId);

  if (response) {
    throw errorType.notFound('Empregado já possui cartão de mesmo tipo.');
  }
}

export async function checkDataInRequestBodyIsValidAnsAssemblesCardObject(type: TransactionTypes, employeeId: number) {
  await checkEmployeeHasCardSameType(type, employeeId);

  const number = generateCardNumber();
  checkCardFlag(number);

  const cardholderName = await generateCardHolderName(employeeId);
  const expirationDate = generateCardExpirationDate();

  return {
    employeeId: Number(employeeId),
    number,
    cardholderName,
    expirationDate,
    password: undefined,
    isVirtual: false,
    originalCardId: undefined,
    isBlocked: false,
    type
  }
}

function generateCardNumber() {
  const cardNumber = faker.finance.creditCardNumber('mastercard');

  return cardNumber.toString();
}

function checkCardFlag(cardNumber: string) {
  const cardNumberFormat = cardNumber.split('-').join('').trim();

  if (!regexMasterCard.test(cardNumberFormat)) {
    checkCardFlag(generateCardNumber());
  }
}

export function checkIfMiddleNameIsLongerThanThreeLetters(fullNameArray: string[]) {
  let middleName: string = '';

  fullNameArray.forEach((name, index, array) => {
    if (index === 0) return;
    if (index === array.length - 1) return;

    const numberOfLettersName = name.split('').length;
    if (numberOfLettersName >= 3) {
      middleName = name[0];
      return;
    }
  })

  return middleName;
}

export function mountsCardHolderName(firstName: string, middleName: string, lastName: string) {
  const middleNameExists = middleName.length > 0;

  if (middleNameExists) {
    return `${firstName} ${middleName} ${lastName}`.toLocaleUpperCase();
  } else {
    return `${firstName} ${lastName}`.toLocaleUpperCase();
  }
}

async function generateCardHolderName(employeeId: number) {
  const { fullName } = await employeeRepository.findById(employeeId);

  const fullNameArray = fullName.split(' ');
  const firstName = fullNameArray[0];
  const lastName = fullNameArray[fullNameArray.length - 1];

  const middleName = checkIfMiddleNameIsLongerThanThreeLetters(fullNameArray);
  const cardHolder = mountsCardHolderName(firstName, middleName, lastName);

  return cardHolder;
}

function generateCardExpirationDate() {
  const MINIMUM_EXPIRATION_YEAR = 5;

  const todayDate = dayjs().format('MM/YY');
  const currentYear = getLastTwoDigits(todayDate);
  const cardExpirationYear = new Date().getFullYear() + MINIMUM_EXPIRATION_YEAR;
  const cardExpirationDate = todayDate.replace(currentYear, getLastTwoDigits(cardExpirationYear.toString()));

  return cardExpirationDate;
}

export function getLastTwoDigits(todayDate: string) {
  return todayDate.substring(todayDate.length - 2, todayDate.length)
}

export function generateEncryptedCardSecurityCode(securityCode: string) {
  return bcrypt.hashSync(securityCode, 10);
}

export function generateCardSecurityCode() {
  return faker.finance.creditCardCVV();
}

export async function createCard(cardData: CardInsertData) {
  await cardRepository.insert(cardData);
}

export async function checkCardIsRegistered(cardId: number) {
  const response = await cardRepository.findById(cardId);

  if (!response) {
    throw errorType.unprocessableEntity('O cartão precisa existir para ser ativado!');
  }

  return response;
}

export function checkExpirationDate(expirationDate: string) {
  const todayDate = dayjs().format('YY/MM');

  const { month: currentMonth, year: currentYear } = convertMonthAndYearToNumber(todayDate);
  const { month: monthExpirationDate, year: yearExpirationDate } = convertMonthAndYearToNumber(expirationDate);

  checkCurrentDateIsGreaterCardExpirationDate(currentYear, currentMonth, monthExpirationDate, yearExpirationDate);
}

function convertMonthAndYearToNumber(date: string) {
  const month = Number(date.split('/')[0]);
  const year = Number(date.split('/')[1]);

  return { month, year };
}

function checkCurrentDateIsGreaterCardExpirationDate(currentYear: number, currentMonth: number,
  monthExpirationDate: number, yearExpirationDate: number) {

  if (currentYear > yearExpirationDate) {
    throw errorType.conflict('A data de expiração do cartão venceu.');

  } else if (currentYear === yearExpirationDate) {
    if (currentMonth > monthExpirationDate) {
      throw errorType.conflict('A data de expiração do cartão venceu.');
    }
  }
}

export function checkCardIsActivatedAndHasPassword(isVirtual: boolean, password: string) {
  if (isVirtual) {
    throw errorType.conflict('Este cartão já esta ativado.');
  }

  if (password) {
    throw errorType.conflict('Este cartão já possui senha.');
  }
}

export function checkCardSecurityCode(userSecurityCode: string, cardSecurityCode: string) {
  if (!bcrypt.compareSync(userSecurityCode, cardSecurityCode)) {
    throw errorType.unprocessableEntity('Codigo de segurança do cartão inválido.');
  }
}

export function checkPasswordHasFourNumericDigitsAndGenerateEncryptedCardPassword(cardPassword: string) {
  if (cardPassword.length !== 4) {
    throw errorType.unprocessableEntity('A senha deve conter 4 dígitos.');
  }

  if (!isNumber(cardPassword)) {
    throw errorType.unprocessableEntity('A senha deve conter apenas digitos númericos.');
  }

  return bcrypt.hashSync(cardPassword, 10);
}

function isNumber(n: string | number | undefined) {
  return !isNaN(parseFloat(n as string)) && isFinite(n as number);
}

export async function cardActive(cardId: number, card: CardUpdateData, encryptedCardPassword: string) {
  await cardRepository.update(cardId, { ...card, password: encryptedCardPassword });
}

export function checkCardPasswordIsValid(cardPassword: string, password: string) {
  if (!bcrypt.compareSync(cardPassword, password)) {
    throw errorType.unprocessableEntity('Senha do cartão esta errada.');
  }
}

function generateBalanceCard(transactions: any[], recharges: any[]) {
  const totalAmountTransactions = addAllAmount(transactions);
  const totalAmountRecharges = addAllAmount(recharges);

  return totalAmountRecharges - totalAmountTransactions;
}

function addAllAmount(arrayWithAmounts: any[]) {
  return arrayWithAmounts.map(({ amount }) => amount)
    .reduce((previousValue, currentValue) =>
      previousValue + currentValue, 0
    )
}

export async function getBalance(cardId: number) {
  const transactions = await paymentService.findPayments(cardId);
  const recharges = await rechargeService.findRecharges(cardId);

  const balance = generateBalanceCard(transactions, recharges);

  return { balance, transactions, recharges };
}