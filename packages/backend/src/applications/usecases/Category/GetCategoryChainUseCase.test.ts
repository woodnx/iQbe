import Category from "@/domains/Category";
import { InMemoryCategoryInfra } from "@/interfaces/infra/InMemory/CategoryInfra";
import { GetCategoryChainUseCase } from "./GetCategoryChainUseCase";

describe("GetCategoryChainUseCase", () => {
  it("カテゴリの親子チェーンを取得できる", async () => {
    const categoryInfra = new InMemoryCategoryInfra();
    const useCase = new GetCategoryChainUseCase(categoryInfra);

    await categoryInfra.save(Category.create("Parent", null, -1, false));
    const parent = await categoryInfra.findByName("Parent");

    if (!parent) throw new Error("Parent category not found");

    await categoryInfra.save(
      Category.create("Child", "child", parent.id, false),
    );
    const child = await categoryInfra.findByName("Child");

    if (!child) throw new Error("Child category not found");

    const result = await useCase.execute({ id: child.id });

    expect(result).toEqual([
      {
        id: parent.id,
        name: "Parent",
        description: null,
        disabled: false,
        parentId: -1,
        sub: null,
      },
      {
        id: child.id,
        name: "Child",
        description: "child",
        disabled: false,
        parentId: parent.id,
        sub: null,
      },
    ]);
  });
});
