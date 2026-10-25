import express from "express";

import { AddCategoryPresetUseCase } from "@/applications/usecases/Category/AddCategoryPresetUseCase.js";
import { CreateCategoryUseCase } from "@/applications/usecases/Category/CreateCategoryUseCase.js";
import { DeleteCategoryUseCase } from "@/applications/usecases/Category/DeleteCategoryUseCase.js";
import { GetCategoriesUseCase } from "@/applications/usecases/Category/GetCategoriesUseCase.js";
import { GetCategoryChainUseCase } from "@/applications/usecases/Category/GetCategoryChainUseCase.js";
import { GetCategoryPresetListUseCase } from "@/applications/usecases/Category/GetCategoryPresetListUseCase.js";
import { UpdateCategoryUseCase } from "@/applications/usecases/Category/UpdateCategoryUseCase.js";
import CategoryController from "@/interfaces/controllers/CategoryController.js";
import CategoryInfra from "@/interfaces/infra/CategoryInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import KyselyTransactionManager from "@/interfaces/infra/kysely/KyselyTransactionManager.js";

const clientManager = new KyselyClientManager();
const categoryInfra = new CategoryInfra(clientManager);
const transactionManager = new KyselyTransactionManager(clientManager);

const categoryController = new CategoryController(
  new GetCategoriesUseCase(categoryInfra),
  new GetCategoryChainUseCase(categoryInfra),
  new CreateCategoryUseCase(categoryInfra),
  new UpdateCategoryUseCase(categoryInfra),
  new DeleteCategoryUseCase(categoryInfra),
  new GetCategoryPresetListUseCase(),
  new AddCategoryPresetUseCase(transactionManager, categoryInfra),
);

const router = express.Router();

router.get("/", categoryController.get());
router.post("/", categoryController.post());
router.get("/:id", categoryController.getFromId());
router.put("/:id", categoryController.put());
router.delete("/:id", categoryController.delete());

router.get("/preset", categoryController.getPreset());
router.post("/preset", categoryController.addFromPreset());

export default router;
