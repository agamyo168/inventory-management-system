import { NextFunction, Request, Response } from 'express';
import logger from '../../utils/logger';
import { StatusCodes } from 'http-status-codes';
import CustomError from './custom/custom.error.class';

const errorHandlerMiddleware = (
  err: CustomError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err);
  const status = err?.status || StatusCodes.INTERNAL_SERVER_ERROR;
  const error = err.message || 'Internal server error try again later.';
  res.status(status).json({
    success: false,
    error,
  });
  return next();
};

export default errorHandlerMiddleware;
