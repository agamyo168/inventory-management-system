import express from "express";
import { upload } from "../controller/inventory.controller";
import { uploadCSV } from "../middlewares/multer";

const router = express.Router();

router.route("/inventory/upload").post(uploadCSV.single("file"), upload);

export default router;
