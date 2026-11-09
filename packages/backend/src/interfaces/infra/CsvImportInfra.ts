import { ApiError } from "@/http/ApiError.js";
import { parse } from "csv/sync";
import CsvImport from "@/domains/CsvImport/index.js";
import ICsvImportRepository from "@/domains/CsvImport/ICsvImportRepository.js";

const columnNames = new Map([
  ["問題文", "question"],
  ["問題", "question"],
  ["答え", "answer"],
  ["解答", "answer"],
  ["回答", "answer"],
  ["正解", "answer"],
  ["別解", "anotherAnswer"],
  ["別解等", "anotherAnswer"],
  ["別解・正誤判定基準", "anotherAnswer"],
  ["正誤判定基準", "anotherAnswer"],
  ["大ジャンル", "categoryName"],
  ["category", "categoryName"],
  ["小ジャンル", "subCategoryName"],
  ["subCategory", "subCategoryName"],
]);

export default class CsvImportInfra implements ICsvImportRepository {
  async parseCsv(file: Buffer) {
    const parsed = parse<{
      question: string;
      answer: string;
      anotherAnswer?: string | string[];
      categoryName?: string;
      subCategoryName?: string;
    }>(file.toString("utf-8"), {
      bom: true,
      columns: (headers: string[]) => {
        const columns = headers.map((header) => {
          const name = header.trim();
          return columnNames.get(name) ?? name;
        });
        if (!columns.includes("question") || !columns.includes("answer")) {
          throw new ApiError().invalidParams(
            "問題文と答えのカラムが必要です。",
          );
        }
        for (const name of [
          "question",
          "answer",
          "categoryName",
          "subCategoryName",
        ]) {
          if (columns.filter((column) => column === name).length > 1) {
            throw new ApiError().invalidParams(
              `カラムが重複しています: ${name}`,
            );
          }
        }
        return columns;
      },
      group_columns_by_name: true,
      skip_empty_lines: true,
    });

    return parsed.map(
      (c) =>
        new CsvImport(
          c.question,
          c.answer,
          Array.isArray(c.anotherAnswer)
            ? c.anotherAnswer.filter((value) => value.trim()).join("\n")
            : (c.anotherAnswer ?? null),
          c.categoryName?.trim() || undefined,
          c.subCategoryName?.trim() || undefined,
        ),
    );
  }
}
