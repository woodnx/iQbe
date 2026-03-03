import WorkbookService from "@/domains/Workbook/WorkbookService";
import { InMemoryWorkbookInfra } from "@/interfaces/infra/InMemory/WorkbookInfra";
import { CreateWorkbookUseCase } from "./CreateWorkbookUseCase";

describe("CreateWorkbookUseCase", () => {
  it("問題集を作成できる", async () => {
    const workbookRepository = new InMemoryWorkbookInfra();
    const useCase = new CreateWorkbookUseCase(
      workbookRepository,
      new WorkbookService(),
    );

    const result = await useCase.execute({
      uid: "user-a",
      name: "New Workbook",
      date: null,
    });

    const stored = await workbookRepository.findByWid(result.wid, "user-a");

    expect(stored?.name).toBe("New Workbook");
    expect(result).toEqual({
      wid: result.wid,
      name: "New Workbook",
      date: null,
      creatorId: "user-a",
      levelId: null,
      color: null,
    });
  });
});
