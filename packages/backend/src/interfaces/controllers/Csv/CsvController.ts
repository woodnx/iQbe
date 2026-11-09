import { ParseCsvUseCase } from "@/applications/usecases/Csv/ParseCsvUseCase.js";
import { ApiError } from "@/http/ApiError.js";
import type { ApiContext } from "@/http/context.js";
import { postCsvParse } from "./schema.js";

export default class CsvController {
  constructor(private parseCsvUseCase: ParseCsvUseCase) {}

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

      const csv = await this.parseCsvUseCase.execute(
        Buffer.from(await file.arrayBuffer()),
      );

      return c.json(csv);
    };
  }
}
