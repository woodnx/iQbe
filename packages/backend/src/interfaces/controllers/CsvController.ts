import ICsvImportRepository from "@/domains/CsvImport/ICsvImportRepository";
import { asyncWrapper } from "@/utils";
import { ApiError } from "api";

export default class CsvController {
  constructor(
    private csvImportRepository: ICsvImportRepository,
  ) {}

  parse() {
    return asyncWrapper(async (req, res) => {
      const file = req.file;
      
      if (!file) {
        throw new ApiError({
          title: "NO_FILE",
          detail: "No file uploaded.",
          type: "about:blank",
          status: 400
        });
      }

      const csv = await this.csvImportRepository.parseCsv(file);

      const sendCsv = csv.map(c => ({
        question: c.question,
        answer: c.answer,
        anotherAnswer: c.anotherAnswer,
      }));
      
      res.send(sendCsv);
    });
  }
}
