import Workbook from "@/domains/Workbook";
import { InMemoryWorkbookInfra } from "@/interfaces/infra/InMemory/WorkbookInfra";
import { UpdateWorkbookUseCase } from "./UpdateWorkbookUseCase";

describe("UpdateWorkbookUseCase", () => {
  it("問題集を更新できる", async () => {
    const workbookRepository = new InMemoryWorkbookInfra();
    const useCase = new UpdateWorkbookUseCase(workbookRepository);

    await workbookRepository.save(
      new Workbook("w1", "Before", null, "user-a", null, null),
    );

    const result = await useCase.execute({
      uid: "user-a",
      wid: "w1",
      name: "After",
      date: "2024-03-03T00:00:00.000Z",
    });

    const stored = await workbookRepository.findByWid("w1", "user-a");

    expect(stored?.name).toBe("After");
    expect(stored?.date).toBe("2024-03-03T00:00:00.000Z");
    expect(result).toEqual({
      wid: "w1",
      name: "After",
      date: null,
      creatorId: "user-a",
      levelId: null,
      color: null,
    });
  });
});
