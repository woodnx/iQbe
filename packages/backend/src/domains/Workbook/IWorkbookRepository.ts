import Workbook from ".";

export default interface IWorkbookRepository {
  findByWid(wid: string): Promise<Workbook | null>;
  findManyByUid(uid: string): Promise<Workbook[]>;
  findAll(): Promise<Workbook[]>;
  save(workbook: Workbook): Promise<void>;
  update(workbook: Workbook): Promise<void>;
  delete(wid: string): Promise<void>;
}
