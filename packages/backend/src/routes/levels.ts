import express from "express";

import LevelController from "@/interfaces/controllers/LevelController";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager";
import LevelInfra from "@/interfaces/infra/LevelInfra";

const clientManager = new KyselyClientManager();
const levelController = new LevelController(new LevelInfra(clientManager));

const router = express.Router();

router.get("/", levelController.get());

module.exports = router;
