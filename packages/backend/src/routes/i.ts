import express, { Router } from "express";
import fs from "fs";
import multer from "multer";
import path from "path";

import IController from "@/interfaces/controllers/IController";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager";
import UserInfra from "@/interfaces/infra/UserInfra";

const router: Router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "/public/images");

    // uploadPathにディレクトリが存在するかどうかを確認
    if (!fs.existsSync(uploadPath)) {
      // uploadPathにディレクトリが存在しない場合、ディレクトリを作成
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = req.user.uid;
    cb(null, `${filename}.png`);
  },
});
const upload = multer({ storage });

const kyselyClientManager = new KyselyClientManager();
const userInfra = new UserInfra(kyselyClientManager);
const iController = new IController(userInfra);

router.get("/", iController.get());
router.put("/", iController.put());
router.post(
  "/image",
  upload.single("file"),
  iController.registerProfileImage(),
);

module.exports = router;
