import { CreateWorkbookUseCase } from "@/applications/usecases/Workbook/CreateWorkbookUseCase.js";
import { DeleteWorkbookUseCase } from "@/applications/usecases/Workbook/DeleteWorkbookUseCase.js";
import { GetAllWorkbooksUseCase } from "@/applications/usecases/Workbook/GetAllWorkbooksUseCase.js";
import { GetWorkbookUseCase } from "@/applications/usecases/Workbook/GetWorkbookUseCase.js";
import { UpdateWorkbookUseCase } from "@/applications/usecases/Workbook/UpdateWorkbookUseCase.js";
import type { ApiContext } from "@/http/context.js";
import {
  deleteWorkbooksWid,
  getWorkbooks,
  getWorkbooksAll,
  getWorkbooksWid,
  postWorkbooks,
  putWorkbooksWid,
} from "./schema.js";

export default class WorkbookController {
  constructor(
    private getWorkbooksUseCase: GetAllWorkbooksUseCase,
    private getWorkbookUseCase: GetWorkbookUseCase,
    private getAllWorkbooksUseCase: GetAllWorkbooksUseCase,
    private createWorkbookUseCase: CreateWorkbookUseCase,
    private updateWorkbookUseCase: UpdateWorkbookUseCase,
    private deleteWorkbookUseCase: DeleteWorkbookUseCase,
  ) {}

  get() {
    return async (c: ApiContext<typeof getWorkbooks>) => {
      const uid = c.get("user").uid;
      const workbooks = await this.getWorkbooksUseCase.execute({ uid });

      return c.json(workbooks, 200);
    };
  }

  getFromWid() {
    return async (c: ApiContext<typeof getWorkbooksWid>) => {
      const param = c.req.valid("param");
      const uid = c.get("user").uid;
      const wid = param.wid;

      const workbook = await this.getWorkbookUseCase.execute({ uid, wid });

      return c.json(workbook, 200);
    };
  }

  getAll() {
    return async (c: ApiContext<typeof getWorkbooksAll>) => {
      const uid = c.get("user").uid;
      const workbooks = await this.getAllWorkbooksUseCase.execute({ uid });

      return c.json(workbooks, 200);
    };
  }

  post() {
    return async (c: ApiContext<typeof postWorkbooks>) => {
      const body = c.req.valid("json");
      const uid = c.get("user").uid;
      const name = body.name;
      const date = body.published || null;

      const workbook = await this.createWorkbookUseCase.execute({
        uid,
        name,
        date,
      });

      return c.json(workbook, 200);
    };
  }

  put() {
    return async (c: ApiContext<typeof putWorkbooksWid>) => {
      const param = c.req.valid("param");
      const body = c.req.valid("json");
      const uid = c.get("user").uid;
      const wid = param.wid;
      const name = body.name;
      const date = body.published || null;

      const workbook = await this.updateWorkbookUseCase.execute({
        uid,
        wid,
        name,
        date,
      });

      return c.json(workbook, 200);
    };
  }

  delete() {
    return async (c: ApiContext<typeof deleteWorkbooksWid>) => {
      const param = c.req.valid("param");
      const uid = c.get("user").uid;
      const wid = param.wid;

      const workbooks = await this.deleteWorkbookUseCase.execute({ uid, wid });

      return c.json(workbooks, 200);
    };
  }
}
