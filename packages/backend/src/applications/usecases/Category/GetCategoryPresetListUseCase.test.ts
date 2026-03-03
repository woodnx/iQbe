import { GetCategoryPresetListUseCase } from "./GetCategoryPresetListUseCase";

describe("GetCategoryPresetListUseCase", () => {
  it("プリセットの一覧を取得できる", () => {
    const useCase = new GetCategoryPresetListUseCase();

    const result = useCase.execute();

    expect(result.length).toBe(2);
    expect(result.map((item) => item.value)).toContain("abc23");
  });
});
