import CsvImport from "./index.js";

export default interface ICsvImportRepository {
  parseCsv: (file: Buffer) => Promise<CsvImport[]>;
}
