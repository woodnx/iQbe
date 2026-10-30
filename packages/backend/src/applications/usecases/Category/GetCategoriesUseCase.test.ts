import Category from "@/domains/Category/index.js";
import { InMemoryCategoryInfra } from "@/interfaces/infra/InMemory/CategoryInfra.js";
import { GetCategoriesUseCase } from "./GetCategoriesUseCase.js";

describe("GetCategoriesUseCase", () => {
  it("カテゴリ一覧とサブカテゴリを取得できる", async () => {
    const categoryInfra = new InMemoryCategoryInfra();
    const useCase = new GetCategoriesUseCase(categoryInfra);

    await categoryInfra.save(Category.create("Parent", null, -1, false));
    const parent = await categoryInfra.findByName("Parent");

    if (!parent) throw new Error("Parent category not found");

    await categoryInfra.save(
      Category.create("Child", "child", parent.id, false),
    );

    const result = await useCase.execute();

    expect(result).toEqual([
      {
        id: parent.id,
        name: "Parent",
        description: null,
        disabled: false,
        parentId: -1,
        sub: [
          {
            id: expect.any(Number),
            name: "Child",
            description: "child",
            parentId: parent.id,
            disabled: false,
          },
        ],
      },
    ]);
  });
});
