import Category from "@/domains/Category";
import { InMemoryCategoryInfra } from "@/interfaces/infra/InMemory/CategoryInfra";
import { UpdateCategoryUseCase } from "./UpdateCategoryUseCase";

describe("UpdateCategoryUseCase", () => {
  it("カテゴリを更新できる", async () => {
    const categoryInfra = new InMemoryCategoryInfra();
    const useCase = new UpdateCategoryUseCase(categoryInfra);

    await categoryInfra.save(Category.create("Target", null, -1, false));
    const target = await categoryInfra.findByName("Target");

    if (!target) throw new Error("Target category not found");

    await useCase.execute({
      id: target.id,
      description: "updated",
      disabled: true,
    });

    const updated = await categoryInfra.findById(target.id);

    expect(updated?.description).toBe("updated");
    expect(updated?.disabled).toBe(true);
  });
});
