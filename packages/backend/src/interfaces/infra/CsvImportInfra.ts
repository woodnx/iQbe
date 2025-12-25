import { ApiError } from "api";
import { parse } from "csv/sync";
import CsvImport from "@/domains/CsvImport";
import ICsvImportRepository from "@/domains/CsvImport/ICsvImportRepository";

export default class CsvImportInfra implements ICsvImportRepository {
  async parseCsv(file: Express.Multer.File) {
    const fileContent = file.buffer.toString("utf-8");

    const parsed = parse<{
      question: string,
      answer: string,
      anotherAnswer: string | null,
    }>(fileContent, {
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
