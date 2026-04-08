import Workbook from "@/domains/Workbook";
import { InMemoryWorkbookInfra } from "@/interfaces/infra/InMemory/WorkbookInfra";
import { GetWorkbooksUseCase } from "./GetWorkbooksUseCase";

describe("GetWorkbooksUseCase", () => {
  it("uidの問題集一覧を取得できる", async () => {
    const workbookRepository = new InMemoryWorkbookInfra();
    const useCase = new GetWorkbooksUseCase(workbookRepository);

    const createdDate = new Date("2024-01-01T00:00:00.000Z");

    await workbookRepository.save(
      new Workbook(
        "w1",
        "First",
        createdDate,
        "user-a",
        1,
        "red",
        0,
        0,
        0,
        0,
        null,
      ),
    );
    await workbookRepository.save(
      new Workbook(
        "w2",
        "Second",
        null,
        "user-a",
        null,
        null,
        0,
        0,
        0,
        0,
        null,
      ),
    );
    await workbookRepository.save(
      new Workbook("w3", "Third", null, "user-b", null, null, 0, 0, 0, 0, null),
    );

    const result = await useCase.execute({ uid: "user-a" });

    expect(result).toEqual([
      {
        wid: "w1",
        name: "First",
        date: createdDate,
        creatorId: "user-a",
        levelId: 1,
        color: "red",
        total: 0,
        corrects: 0,
        wrongs: 0,
        ignored: 0,
        lastPracticedAt: null,
      },
      {
        wid: "w2",
        name: "Second",
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
