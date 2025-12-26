import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import logger from "../utils/logger";
import { BadRequestError } from "../middlewares/error";
import { pipeline } from "../services/inventory.service";

export const upload = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      throw new BadRequestError("CSV_REQUIRED"); //TODO: Centeralized Error message handling
    }
    logger.info("CSV Received");
    //
    const data = await pipeline(req.file.buffer);

    res.status(StatusCodes.OK).json({ sucess: true, data });
  } catch (err) {
    return next(err);
  }
};
