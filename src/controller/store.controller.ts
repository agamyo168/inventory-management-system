import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';
import { pdfReport } from '../services/store.service';
import { BadRequestError } from '../middlewares/error';

export const getPdfReport = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    logger.info('Download Report');
    const storeId = parseInt(req.params.storeId, 10);
    if (isNaN(storeId)) {
      throw new BadRequestError('STORE_ID_MUST_BE_A_NUMBER');
    }

    const { storeName, doc } = await pdfReport(storeId);
    const fileName = `${storeName}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    doc.pipe(res);
  } catch (error) {
    logger.error(error);
    return next(error);
  }
};
