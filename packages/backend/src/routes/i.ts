import IController from '@/interfaces/controllers/IController';
import KyselyClientManager from '@/interfaces/infra/kysely/KyselyClientManager';
import UserInfra from '@/interfaces/infra/UserInfra';
import express, { Router } from 'express';
import multer from 'multer';
import path from 'path';

const router: Router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/images'));
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
router.post('/image', upload.single('file'), iController.registerProfileImage())

module.exports = router;