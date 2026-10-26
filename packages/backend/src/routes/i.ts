import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import { validate } from "@/http/validate.js";
import IController from "@/interfaces/controllers/I/IController.js";
import { getI, postIImage, putI } from "@/interfaces/controllers/I/schema.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import UserInfra from "@/interfaces/infra/UserInfra.js";

const kyselyClientManager = new KyselyClientManager();
const userInfra = new UserInfra(kyselyClientManager);
const iController = new IController(userInfra);

const router = new Hono<AppEnv>()
  .get("/", iController.get())
  .put("/", validate("json", putI.json), iController.put())
  .post(
    "/image",
    validate("form", postIImage.form),
    iController.registerProfileImage(),
  );
export default router;
