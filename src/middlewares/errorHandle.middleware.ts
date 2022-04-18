import { Request, Response, NextFunction } from 'express';

interface objectError {
  messageError: string,
  type: string,
};

const ERROR_ENUM: { [x: string]: number } = {
  "not_found": 404,
  "conflict": 409,
  "not_authorized": 401,
  "unprocessable_entity": 422,
}

export function errorHandler(error: objectError, req: Request, res: Response, next: NextFunction) {
  let { messageError, type } = error;

  messageError === undefined && (messageError = "Erro no servidor");

  const SERVER_ERROR = 500;

  const STATUS_CODE = ERROR_ENUM[type] || SERVER_ERROR;

  return res.status(STATUS_CODE).json({ messageError });
}