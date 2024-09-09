import CsvImport from ".";

export default interface ICsvImportRepository {
  parseCsv: (file: Express.Multer.File) => Promise<CsvImport[]>,
}
