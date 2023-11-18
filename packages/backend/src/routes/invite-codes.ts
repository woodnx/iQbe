import express from 'express';
import dotenv from 'dotenv';
import Hashids from 'hashids';
import { db } from '../database';

const router = express.Router();
dotenv.config();

const inviteCodeHash = new Hashids(
  /* salt: */      process.env.INVITE_CODE_SALT,
  /* minLength: */ 8,
  /* alphabet: */  process.env.INVITE_CODE_ALPHABET,
);

router.post('/generate', async (req, res) => {
  // 招待コード生成のエンドポイント
  try {
    await db.transaction().execute(async trx => {
      const totalCodes = await db.selectFrom('invite_codes').select('id').orderBy('id').limit(1).execute();
      const lastCode = totalCodes.length !== 0 ? totalCodes[0].id : 0;
      const newInviteCodeId = [ ...Array(lastCode + 1).keys() ];
      const code = inviteCodeHash.encode(newInviteCodeId);

      const data = {
        code,
      };  

      await trx.insertInto('invite_codes')
      .values(data)
      .execute();

      res.status(200).send({ code });
    });
  } catch(e) {
    console.error(e);
  }
});

module.exports = router;