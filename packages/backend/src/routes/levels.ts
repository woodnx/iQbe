import express, { Router } from 'express'
import knex from '../knex'

const router: Router = express.Router()

router.get('/', async (req, res) => {
  try {
    const result = await knex('levels').select('*')
    res.status(200).send(result)
  } catch(err) {
    console.error(err)
  }
})

module.exports = router