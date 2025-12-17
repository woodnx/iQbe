import express from "express";

import CategoryController from "@/interfaces/controllers/CategoryController";
import CategoryInfra from "@/interfaces/infra/CategoryInfra";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager";
import CategoryUseCase from "@/applications/usecases/CategoryUseCase";
import KyselyTransactionManager from "@/interfaces/infra/kysely/KyselyTransactionManager";

const clientManager = new KyselyClientManager();
const categoryInfra = new CategoryInfra(clientManager);

const categoryController = new CategoryController(
  categoryInfra,
  new CategoryUseCase(
    new KyselyTransactionManager(clientManager),
    categoryInfra,
  ),
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
