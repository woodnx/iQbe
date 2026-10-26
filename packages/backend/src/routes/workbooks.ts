import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import {
  getWorkbooks,
  getWorkbooksAll,
  getWorkbooksWid,
  postWorkbooks,
  putWorkbooksWid,
  deleteWorkbooksWid,
} from "@/http/schemas.js";
import { validate } from "@/http/validate.js";

import { CreateWorkbookUseCase } from "@/applications/usecases/Workbook/CreateWorkbookUseCase.js";
import { DeleteWorkbookUseCase } from "@/applications/usecases/Workbook/DeleteWorkbookUseCase.js";
import { GetAllWorkbooksUseCase } from "@/applications/usecases/Workbook/GetAllWorkbooksUseCase.js";
import { GetWorkbookUseCase } from "@/applications/usecases/Workbook/GetWorkbookUseCase.js";
import { UpdateWorkbookUseCase } from "@/applications/usecases/Workbook/UpdateWorkbookUseCase.js";
import WorkbookService from "@/domains/Workbook/WorkbookService.js";
import WorkbookController from "@/interfaces/controllers/WorkbookController.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import WorkbookInfra from "@/interfaces/infra/WorkbookInfra.js";

const clientManager = new KyselyClientManager();
const workbookInfra = new WorkbookInfra(clientManager);
const workbookService = new WorkbookService();
const getWorkbooksUseCase = new GetAllWorkbooksUseCase(workbookInfra);
const getWorkbookUseCase = new GetWorkbookUseCase(workbookInfra);
const getAllWorkbooksUseCase = new GetAllWorkbooksUseCase(workbookInfra);
const createWorkbookUseCase = new CreateWorkbookUseCase(
  workbookInfra,
  workbookService,
);
const updateWorkbookUseCase = new UpdateWorkbookUseCase(workbookInfra);
const deleteWorkbookUseCase = new DeleteWorkbookUseCase(workbookInfra);
const workbookController = new WorkbookController(
  getWorkbooksUseCase,
  getWorkbookUseCase,
  getAllWorkbooksUseCase,
  createWorkbookUseCase,
  updateWorkbookUseCase,
  deleteWorkbookUseCase,
);

const router = new Hono<AppEnv>()
  .get("/", workbookController.get())
  .get("/all", workbookController.getAll())
  .post("/", validate("json", postWorkbooks.json), workbookController.post())
  .get(
    "/:wid",
    validate("param", getWorkbooksWid.param),
    workbookController.getFromWid(),
  )
  .put(
    "/:wid",
    validate("param", putWorkbooksWid.param),
    validate("json", putWorkbooksWid.json),
    workbookController.put(),
  )
  .delete(
    "/:wid",
    validate("param", deleteWorkbooksWid.param),
    workbookController.delete(),
  );
export default router;
