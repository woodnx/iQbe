import { InMemoryCategoryInfra } from "@/interfaces/infra/InMemory/CategoryInfra";
import { MockTransactionManager } from "../shared/MockTransactionManager";
import { AddCategoryPresetUseCase } from "./AddCategoryPresetUseCase";

describe("AddCategoryPresetUseCase", () => {
  it("プリセットカテゴリを追加できる", async () => {
    const categoryInfra = new InMemoryCategoryInfra();
    const useCase = new AddCategoryPresetUseCase(
      new MockTransactionManager(),
      categoryInfra,
    );

    await useCase.execute({ preset: "minhaya" });

    const categories = await categoryInfra.getAll();
    const names = categories.map((category) => category.name);

    expect(names).toEqual([
      "文学",
      "自然科学",
      "社会",
      "地歴",
      "生活",
      "エンタメ",
      "スポーツ",
    ]);
  });
});
