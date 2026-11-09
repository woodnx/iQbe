import type Category from "@/domains/Category/index.js";
import type ICategoryRepository from "@/domains/Category/ICategoryRepository.js";
import type ICsvImportRepository from "@/domains/CsvImport/ICsvImportRepository.js";

export class ParseCsvUseCase {
  constructor(
    private csv: ICsvImportRepository,
    private categories: ICategoryRepository,
  ) {}

  async execute(file: Buffer) {
    const rows = await this.csv.parseCsv(file);
    const categories = rows.some(
      (row) => row.categoryName || row.subCategoryName,
    )
      ? await this.categories.getAll()
      : [];
    const parents = categories.filter(
      (category) => category.parentId === -1 && !category.disabled,
    );

    return rows.map((row) => {
      let parent: Category | undefined;
      let child: Category | undefined;
      let categoryError: string | undefined;
      if (row.categoryName) {
        const matches = parents.filter(
          (category) => category.name === row.categoryName,
        );
        if (matches.length !== 1) {
          categoryError = `大ジャンル「${row.categoryName}」を特定できません。選び直してください。`;
        } else {
          parent = matches[0];
        }
      }
      if (row.subCategoryName && !categoryError) {
        const matches = categories.filter(
          (category) =>
            !category.disabled &&
            category.name === row.subCategoryName &&
            (parent
              ? category.parentId === parent.id
              : parents.some((p) => p.id === category.parentId)),
        );
        if (matches.length !== 1) {
          categoryError = `小ジャンル「${row.subCategoryName}」を特定できません。大ジャンルとの組み合わせを確認してください。`;
        } else {
          child = matches[0];
          parent ??= parents.find(
            (category) => category.id === matches[0].parentId,
          );
        }
      }
      return {
        question: row.question,
        answer: row.answer,
        anotherAnswer: row.anotherAnswer,
        category: categoryError ? undefined : (child?.id ?? parent?.id),
        categoryName: row.categoryName ?? parent?.name,
        subCategoryName: row.subCategoryName ?? child?.name,
        categoryError,
      };
    });
  }
}
