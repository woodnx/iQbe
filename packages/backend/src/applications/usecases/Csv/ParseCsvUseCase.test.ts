import Category from "@/domains/Category/index.js";
import CsvImportInfra from "@/interfaces/infra/CsvImportInfra.js";
import { InMemoryCategoryInfra } from "@/interfaces/infra/InMemory/CategoryInfra.js";
import { ParseCsvUseCase } from "./ParseCsvUseCase.js";

describe("ParseCsvUseCase", () => {
  let categories: InMemoryCategoryInfra;
  let useCase: ParseCsvUseCase;
  beforeEach(async () => {
    categories = new InMemoryCategoryInfra();
    for (const category of [
      new Category(1, "科学", null, -1),
      new Category(2, "数学", null, 1),
      new Category(3, "文学", null, -1),
      new Category(4, "その他", null, 1),
      new Category(5, "その他", null, 3),
      new Category(6, "無効", null, 1, true),
    ])
      await categories.save(category);
    useCase = new ParseCsvUseCase(new CsvImportInfra(), categories);
  });
  const csv = (values: string) =>
    Buffer.from(`問題,解答,大ジャンル,小ジャンル\nQ,A,${values}`);

  it("resolves child, parent-only, child-only and blank categories", async () => {
    const result = await useCase.execute(
      csv("科学,数学\nQ,A,科学,\nQ,A,,数学\nQ,A,,"),
    );
    expect(result.map((row) => row.category)).toEqual([2, 1, 2, undefined]);
    expect(result[2]).toMatchObject({
      categoryName: "科学",
      subCategoryName: "数学",
    });
  });
  it("uses the parent to disambiguate identical child names", async () => {
    expect((await useCase.execute(csv("文学,その他")))[0].category).toBe(5);
  });
  it.each([
    "未知,",
    "未知,数学",
    "科学,未知",
    "文学,数学",
    ",その他",
    "科学,無効",
  ])(
    "keeps unresolved names for editing without losing other rows: %s",
    async (values) => {
      const [unresolved, valid] = await useCase.execute(
        csv(`${values}\nQ2,A2,科学,数学`),
      );
      const [categoryName, subCategoryName] = values.split(",");
      expect(unresolved).toMatchObject({
        question: "Q",
        answer: "A",
        category: undefined,
        categoryName: categoryName || undefined,
        subCategoryName: subCategoryName || undefined,
        categoryError: expect.any(String),
      });
      expect(valid).toMatchObject({
        question: "Q2",
        category: 2,
        categoryError: undefined,
      });
    },
  );
  it("does not access categories for CSV without genres", async () => {
    const getAll = vi.spyOn(categories, "getAll");
    await useCase.execute(Buffer.from("question,answer\nQ,A"));
    expect(getAll).not.toHaveBeenCalled();
  });
});
