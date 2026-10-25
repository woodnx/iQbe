import Workbook from "./index.js";

export default interface IWorkbookRepository {
  findByWid(wid: string, uid: string): Promise<Workbook | null>;
  findManyByUid(uid: string): Promise<Workbook[]>;
  save(workbook: Workbook): Promise<void>;
  update(workbook: Workbook): Promise<void>;
  delete(wid: string): Promise<void>;
}
