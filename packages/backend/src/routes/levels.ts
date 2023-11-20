import express, { Router } from 'express'
import { db } from '@/database'

const router: Router = express.Router()

router.get('/', async (req, res) => {
  try {
    const levels = await db.selectFrom('levels').selectAll().execute();
    res.status(200).send(levels)
  } catch(err) {
    console.error(err)
  }
})

module.exports = router