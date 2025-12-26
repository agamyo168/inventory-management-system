import { NextFunction, Request, Response } from 'express';
import NotFound from './error/custom/notfound.error.class';
const notFoundMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  return next(new NotFound("This resource doesn't exist"));
};

export default notFoundMiddleware;
