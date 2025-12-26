import { StatusCodes } from 'http-status-codes';
import CustomError from './custom.error.class';

class UnauthorizedError extends CustomError {
  constructor(message: string) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}
export default UnauthorizedError;
