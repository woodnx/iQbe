import express from "express";
import multer from "multer";

import CsvController from "@/interfaces/controllers/CsvController.js";
import CsvImportInfra from "@/interfaces/infra/CsvImportInfra.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

const csvController = new CsvController(new CsvImportInfra());

router.post("/parse", upload.single("file"), csvController.parse());

export default router;
