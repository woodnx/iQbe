import InviteCodeController from "@/interfaces/controllers/InviteCodeController.js";
import InviteCodeInfra from "@/interfaces/infra/InviteCodeInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import express from "express";

const inviteCodeController = new InviteCodeController(
  new InviteCodeInfra(new KyselyClientManager()),
);

const router = express.Router();

router.get("/", inviteCodeController.get());
router.post("/", inviteCodeController.create());

export default router;
