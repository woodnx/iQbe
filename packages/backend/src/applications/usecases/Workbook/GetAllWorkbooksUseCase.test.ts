import Workbook from "@/domains/Workbook/index.js";
import { InMemoryWorkbookInfra } from "@/interfaces/infra/InMemory/WorkbookInfra.js";
import { GetAllWorkbooksUseCase } from "./GetAllWorkbooksUseCase.js";

describe("GetAllWorkbooksUseCase", () => {
  it("uidの問題集一覧を取得できる", async () => {
    const workbookRepository = new InMemoryWorkbookInfra();
    const useCase = new GetAllWorkbooksUseCase(workbookRepository);

    await workbookRepository.save(
      new Workbook("w1", "First", null, "user-a", null, null, 0, 0, 0, 0, null),
    );

    const result = await useCase.execute({ uid: "user-a" });

    expect(result).toEqual([
      {
        wid: "w1",
        name: "First",
        date: undefined,
        creatorId: "user-a",
        levelId: null,
        color: null,
        total: 0,
        corrects: 0,
        wrongs: 0,
        ignored: 0,
        lastPracticedAt: null,
      },
    ]);
  });
});
