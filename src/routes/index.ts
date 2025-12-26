import express from "express";
import { upload } from "../controller/inventory.controller";
import { uploadCSV } from "../middlewares/multer";
import { getPdfReport } from "../controller/store.controller";

const router = express.Router();

router.route("/inventory/upload").post(uploadCSV.single("file"), upload);
router.route("/store/:storeId/download-report").get(getPdfReport);

export default router;
