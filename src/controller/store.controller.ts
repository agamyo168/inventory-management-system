import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { pdfReport } from "../services/store.service";
import { BadRequestError } from "../middlewares/error";

export const getPdfReport = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info("Download Report");
    const storeId = parseInt(req.params.storeId, 10);
    if (isNaN(storeId)) {
      throw new BadRequestError("STORE_ID_MUST_BE_A_NUMBER");
    }

    const doc = await pdfReport(storeId);
    doc.pipe(res);
    //TODO: send back a PDF
    // res.status(StatusCodes.OK).json({
    //   success: true,
    // });
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
