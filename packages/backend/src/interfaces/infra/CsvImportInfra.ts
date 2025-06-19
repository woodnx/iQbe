import { parse } from "csv/sync";
import ICsvImportRepository from "@/domains/CsvImport/ICsvImportRepository";
import { ApiError } from "api";
import CsvImport from "@/domains/CsvImport";

export default class CsvImportInfra implements ICsvImportRepository {
  async parseCsv(file: Express.Multer.File) {
    const fileContent = file.buffer.toString("utf-8");

    const parsed = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    if (!Array.isArray(parsed)) {
      throw new ApiError({
        title: "INVILED_FILE",
        detail: "This file inviled file.",
        type: "about:blank",
        status: 400,
      });
    }

    const result = parsed.map(
      (c) => new CsvImport(c.question, c.answer, c.anotherAnswer),
    );

    return result;
  }
}
