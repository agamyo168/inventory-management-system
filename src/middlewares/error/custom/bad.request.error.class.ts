import { StatusCodes } from 'http-status-codes';
import CustomError from './custom.error.class';

class BadRequestError extends CustomError {
  constructor(message: string) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}
export default BadRequestError;
