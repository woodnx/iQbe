import express from "express";

import LevelController from "@/interfaces/controllers/LevelController.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import LevelInfra from "@/interfaces/infra/LevelInfra.js";

const clientManager = new KyselyClientManager();
const levelController = new LevelController(new LevelInfra(clientManager));

const router = express.Router();

router.get("/", levelController.get());

export default router;
