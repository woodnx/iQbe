import Workbook from "@/domains/Workbook/index.js";
import { InMemoryWorkbookInfra } from "@/interfaces/infra/InMemory/WorkbookInfra.js";
import { DeleteWorkbookUseCase } from "./DeleteWorkbookUseCase.js";

describe("DeleteWorkbookUseCase", () => {
  it("rejects deleting another user's workbook", async () => {
    const repo = new InMemoryWorkbookInfra();
    await repo.save(
      new Workbook(
        "private",
        "Owned",
        null,
        "owner",
        null,
        null,
        0,
        0,
        0,
        0,
        null,
      ),
    );
    await expect(
      new DeleteWorkbookUseCase(repo).execute({ uid: "other", wid: "private" }),
    ).rejects.toThrow();
    expect(await repo.findByWid("private", "owner")).not.toBeNull();
  });
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
