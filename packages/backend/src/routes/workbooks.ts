import express from "express";

import { CreateWorkbookUseCase } from "@/applications/usecases/CreateWorkbookUseCase";
import { DeleteWorkbookUseCase } from "@/applications/usecases/DeleteWorkbookUseCase";
import { GetAllWorkbooksUseCase } from "@/applications/usecases/GetAllWorkbooksUseCase";
import { GetWorkbooksUseCase } from "@/applications/usecases/GetWorkbooksUseCase";
import { GetWorkbookUseCase } from "@/applications/usecases/GetWorkbookUseCase";
import { UpdateWorkbookUseCase } from "@/applications/usecases/UpdateWorkbookUseCase";
import WorkbookService from "@/domains/Workbook/WorkbookService";
import WorkbookController from "@/interfaces/controllers/WorkbookController";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager";
import WorkbookInfra from "@/interfaces/infra/WorkbookInfra";

const clientManager = new KyselyClientManager();
const workbookInfra = new WorkbookInfra(clientManager);
const workbookService = new WorkbookService();
const getWorkbooksUseCase = new GetWorkbooksUseCase(workbookInfra);
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

const router = express.Router();

router.get("/", workbookController.get());
router.get("/all", workbookController.getAll());
router.get("/:wid", workbookController.getFromWid());
router.post("/", workbookController.post());
router.put("/:wid", workbookController.put());
router.delete("/:wid", workbookController.delete());

module.exports = router;
