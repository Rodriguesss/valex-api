import * as errorType from '../utils/errorTypes.utils';
import * as employeeRepository from '../repositories/employeeRepository';

export async function validateEmployee(employeeId: number) {
  const response = await employeeRepository.findById(employeeId);

  if (response) {
    throw errorType.notFound('Empregado não esta cadastrado no sistema.');
  }
}