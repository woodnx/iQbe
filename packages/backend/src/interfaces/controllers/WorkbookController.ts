import { CreateWorkbookUseCase } from "@/applications/usecases/CreateWorkbookUseCase";
import { DeleteWorkbookUseCase } from "@/applications/usecases/DeleteWorkbookUseCase";
import { GetAllWorkbooksUseCase } from "@/applications/usecases/GetAllWorkbooksUseCase";
import { GetWorkbooksUseCase } from "@/applications/usecases/GetWorkbooksUseCase";
import { GetWorkbookUseCase } from "@/applications/usecases/GetWorkbookUseCase";
import { UpdateWorkbookUseCase } from "@/applications/usecases/UpdateWorkbookUseCase";
import { typedAsyncWrapper } from "@/utils";

export default class WorkbookController {
  constructor(
    private getWorkbooksUseCase: GetWorkbooksUseCase,
    private getWorkbookUseCase: GetWorkbookUseCase,
    private getAllWorkbooksUseCase: GetAllWorkbooksUseCase,
    private createWorkbookUseCase: CreateWorkbookUseCase,
    private updateWorkbookUseCase: UpdateWorkbookUseCase,
    private deleteWorkbookUseCase: DeleteWorkbookUseCase,
  ) {}

  get() {
    return typedAsyncWrapper<"/workbooks", "get">(async (req, res) => {
      const uid = req.user.uid;
      const workbooks = await this.getWorkbooksUseCase.execute({ uid });

      res.status(200).send(workbooks);
    });
  }

  getFromWid() {
    return typedAsyncWrapper<"/workbooks/{wid}", "get">(async (req, res) => {
      const uid = req.user.uid;
      const wid = req.params.wid;

      const workbook = await this.getWorkbookUseCase.execute({ uid, wid });

      res.status(200).send(workbook);
    });
  }

  getAll() {
    return typedAsyncWrapper<"/workbooks/all", "get">(async (req, res) => {
      const uid = req.user.uid;
      const workbooks = await this.getAllWorkbooksUseCase.execute({ uid });

      res.status(200).send(workbooks);
    });
  }

  post() {
    return typedAsyncWrapper<"/workbooks", "post">(async (req, res) => {
      const uid = req.user.uid;
      const name = req.body.name;
      const date = req.body.published || null;

      const workbook = await this.createWorkbookUseCase.execute({
        uid,
        name,
        date,
      });

      res.status(200).send(workbook);
    });
  }

  put() {
    return typedAsyncWrapper<"/workbooks/{wid}", "put">(async (req, res) => {
      const uid = req.user.uid;
      const wid = req.params.wid;
      const name = req.body.name;
      const date = req.body.published || null;

      const workbook = await this.updateWorkbookUseCase.execute({
        uid,
        wid,
        name,
        date,
      });

      res.status(200).send(workbook);
    });
  }

  delete() {
    return typedAsyncWrapper<"/workbooks/{wid}", "delete">(async (req, res) => {
      const uid = req.user.uid;
      const wid = req.params.wid;

      const workbooks = await this.deleteWorkbookUseCase.execute({ uid, wid });

      res.status(200).send(workbooks);
    });
  }
}
