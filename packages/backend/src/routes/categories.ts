import express from "express";

import { AddCategoryPresetUseCase } from "@/applications/usecases/AddCategoryPresetUseCase";
import { CreateCategoryUseCase } from "@/applications/usecases/CreateCategoryUseCase";
import { DeleteCategoryUseCase } from "@/applications/usecases/DeleteCategoryUseCase";
import { GetCategoriesUseCase } from "@/applications/usecases/GetCategoriesUseCase";
import { GetCategoryChainUseCase } from "@/applications/usecases/GetCategoryChainUseCase";
import { GetCategoryPresetListUseCase } from "@/applications/usecases/GetCategoryPresetListUseCase";
import { UpdateCategoryUseCase } from "@/applications/usecases/UpdateCategoryUseCase";
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
