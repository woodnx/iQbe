import Workbook from "@/domains/Workbook";
import { InMemoryWorkbookInfra } from "@/interfaces/infra/InMemory/WorkbookInfra";
import { DeleteWorkbookUseCase } from "./DeleteWorkbookUseCase";

describe("DeleteWorkbookUseCase", () => {
  it("問題集を削除して一覧を返せる", async () => {
    const workbookRepository = new InMemoryWorkbookInfra();
    const useCase = new DeleteWorkbookUseCase(workbookRepository);

    await workbookRepository.save(
      new Workbook("w1", "First", null, "user-a", null, null, 0, 0, 0, 0, null),
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

    const result = await useCase.execute({ uid: "user-a", wid: "w1" });

    const deleted = await workbookRepository.findByWid("w1", "user-a");
    expect(deleted).toBeNull();
    expect(result).toEqual([
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
