import TagController from "@/interfaces/controllers/TagController";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager";
import TagInfra from "@/interfaces/infra/TagInfra";
import express from "express";

const router = express.Router();

const tagController = new TagController(
  new TagInfra(new KyselyClientManager()),
);

router.get("/", tagController.get());

module.exports = router;
