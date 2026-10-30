import ICsvImportRepository from "@/domains/CsvImport/ICsvImportRepository.js";
import { ApiError } from "@/http/ApiError.js";
import type { ApiContext } from "@/http/context.js";
import { postCsvParse } from "./schema.js";

export default class CsvController {
  constructor(private csvImportRepository: ICsvImportRepository) {}

  parse() {
    return async (c: ApiContext<typeof postCsvParse>) => {
      const file = c.req.valid("form").file;

      if (!file) {
        throw new ApiError({
          title: "NO_FILE",
          detail: "No file uploaded.",
          type: "about:blank",
          status: 400,
        });
      }

      const csv = await this.csvImportRepository.parseCsv(
        Buffer.from(await file.arrayBuffer()),
      );

      const sendCsv = csv.map((c) => ({
        question: c.question,
        answer: c.answer,
        anotherAnswer: c.anotherAnswer,
      }));

      return c.json(sendCsv);
    };
  }
}
