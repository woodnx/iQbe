import Category from "@/domains/Category";
import { InMemoryCategoryInfra } from "@/interfaces/infra/InMemory/CategoryInfra";
import { DeleteCategoryUseCase } from "./DeleteCategoryUseCase";

describe("DeleteCategoryUseCase", () => {
  it("カテゴリを削除できる", async () => {
    const categoryInfra = new InMemoryCategoryInfra();
    const useCase = new DeleteCategoryUseCase(categoryInfra);

    await categoryInfra.save(Category.create("Target", null, -1, false));
    const target = await categoryInfra.findByName("Target");

    if (!target) throw new Error("Target category not found");

    await useCase.execute({ id: target.id });

    const deleted = await categoryInfra.findById(target.id);

    expect(deleted).toBeUndefined();
  });
});
