import CsvImport from "./index.js";

export default interface ICsvImportRepository {
  parseCsv: (file: Express.Multer.File) => Promise<CsvImport[]>;
}
