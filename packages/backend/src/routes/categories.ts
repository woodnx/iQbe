import express from "express";

import { AddCategoryPresetUseCase } from "@/applications/usecases/Category/AddCategoryPresetUseCase";
import { CreateCategoryUseCase } from "@/applications/usecases/Category/CreateCategoryUseCase";
import { DeleteCategoryUseCase } from "@/applications/usecases/Category/DeleteCategoryUseCase";
import { GetCategoriesUseCase } from "@/applications/usecases/Category/GetCategoriesUseCase";
import { GetCategoryChainUseCase } from "@/applications/usecases/Category/GetCategoryChainUseCase";
import { GetCategoryPresetListUseCase } from "@/applications/usecases/Category/GetCategoryPresetListUseCase";
import { UpdateCategoryUseCase } from "@/applications/usecases/Category/UpdateCategoryUseCase";
import CategoryController from "@/interfaces/controllers/CategoryController";
import CategoryInfra from "@/interfaces/infra/CategoryInfra";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager";
import KyselyTransactionManager from "@/interfaces/infra/kysely/KyselyTransactionManager";

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

module.exports = router;
