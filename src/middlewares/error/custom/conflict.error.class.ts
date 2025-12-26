import { StatusCodes } from 'http-status-codes';
import CustomError from './custom.error.class';

class ConflictError extends CustomError {
  constructor(message: string) {
    super(message, StatusCodes.CONFLICT);
  }
}
export default ConflictError;
