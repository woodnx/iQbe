import Workbook from "@/domains/Workbook/index.js";
import IWorkbookRepository from "@/domains/Workbook/IWorkbookRepository.js";

export class InMemoryWorkbookInfra implements IWorkbookRepository {
  public DB: {
    [wid: string]: Workbook;
  } = {};

  async findByWid(wid: string, uid: string): Promise<Workbook | null> {
    const workbook = this.DB[wid];

    if (!workbook || workbook.creatorUid !== uid) return null;

    return workbook;
  }

  async findManyByUid(uid: string): Promise<Workbook[]> {
    return Object.values(this.DB).filter(
      (workbook) => workbook.creatorUid === uid,
    );
  }

  async save(workbook: Workbook): Promise<void> {
    this.DB[workbook.wid] = workbook;
  }

  async update(workbook: Workbook): Promise<void> {
    this.DB[workbook.wid] = workbook;
  }

  async delete(wid: string): Promise<void> {
    delete this.DB[wid];
  }
}
