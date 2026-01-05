import express from 'express';
import { upload, uploadSlow } from '../controller/inventory.controller';
import { uploadCSV } from '../middlewares/multer';
import { getPdfReport } from '../controller/store.controller';

const router = express.Router();

router.route('/inventory/upload').post(uploadCSV.single('file'), upload);
router
  .route('/inventory/upload-slow')
  .post(uploadCSV.single('file'), uploadSlow);

router.route('/store/:storeId/download-report').get(getPdfReport);

export default router;
