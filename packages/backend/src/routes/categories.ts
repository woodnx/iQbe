import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import {
  getCategories,
  postCategories,
  getCategoriesId,
  putCategoriesId,
  deleteCategoriesId,
  getCategoriesPreset,
  postCategoriesPreset,
} from "@/http/schemas.js";
import { validate } from "@/http/validate.js";

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

const router = new Hono<AppEnv>()
  .get("/", categoryController.get())
  .post("/", validate("json", postCategories.json), categoryController.post())
  .get("/preset", categoryController.getPreset())
  .post(
    "/preset",
    validate("json", postCategoriesPreset.json),
    categoryController.addFromPreset(),
  )
  .get(
    "/:id",
    validate("param", getCategoriesId.param),
    categoryController.getFromId(),
  )
  .put(
    "/:id",
    validate("param", putCategoriesId.param),
    validate("json", putCategoriesId.json),
    categoryController.put(),
  )
  .delete(
    "/:id",
    validate("param", deleteCategoriesId.param),
    categoryController.delete(),
  );
export default router;
