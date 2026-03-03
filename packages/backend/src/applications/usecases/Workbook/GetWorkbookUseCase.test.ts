import Workbook from "@/domains/Workbook";
import { InMemoryWorkbookInfra } from "@/interfaces/infra/InMemory/WorkbookInfra";
import { GetWorkbookUseCase } from "./GetWorkbookUseCase";

describe("GetWorkbookUseCase", () => {
  it("widに対応した問題集を取得できる", async () => {
    const workbookRepository = new InMemoryWorkbookInfra();
    const useCase = new GetWorkbookUseCase(workbookRepository);

    const createdDate = new Date("2024-02-02T00:00:00.000Z");

    await workbookRepository.save(
      new Workbook("w1", "First", createdDate, "user-a", 1, "red"),
    );

    const result = await useCase.execute({ uid: "user-a", wid: "w1" });

    expect(result).toEqual({
      wid: "w1",
      name: "First",
      date: createdDate,
      creatorId: "user-a",
      levelId: 1,
      color: "red",
    });
  });
});
