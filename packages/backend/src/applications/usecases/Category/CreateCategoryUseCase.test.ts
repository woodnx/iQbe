import { InMemoryCategoryInfra } from "@/interfaces/infra/InMemory/CategoryInfra.js";
import { CreateCategoryUseCase } from "./CreateCategoryUseCase.js";

describe("CreateCategoryUseCase", () => {
  it("カテゴリを作成できる", async () => {
    const categoryInfra = new InMemoryCategoryInfra();
    const useCase = new CreateCategoryUseCase(categoryInfra);

    await useCase.execute({
      name: "New",
      description: "desc",
      parentId: null,
      disabled: false,
    });

    const created = await categoryInfra.findByName("New");

    expect(created?.name).toBe("New");
    expect(created?.description).toBe("desc");
    expect(created?.parentId).toBe(-1);
  });
});
