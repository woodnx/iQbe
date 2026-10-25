import TagController from "@/interfaces/controllers/TagController.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import TagInfra from "@/interfaces/infra/TagInfra.js";
import express from "express";

const router = express.Router();

const tagController = new TagController(
  new TagInfra(new KyselyClientManager()),
);

router.get("/", tagController.get());

export default router;
