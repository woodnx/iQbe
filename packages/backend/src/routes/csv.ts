import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import { validate } from "@/http/validate.js";
import CsvController from "@/interfaces/controllers/Csv/CsvController.js";
import { postCsvParse } from "@/interfaces/controllers/Csv/schema.js";
import CsvImportInfra from "@/interfaces/infra/CsvImportInfra.js";

const csvController = new CsvController(new CsvImportInfra());

const router = new Hono<AppEnv>().post(
  "/parse",
  validate("form", postCsvParse.form),
  csvController.parse(),
);
export default router;
