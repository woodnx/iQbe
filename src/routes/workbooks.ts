import express, { Router } from 'express'
import knex from '../knex'

const router: Router = express.Router()

router.get('/', async (req, res) => {
  try {
    const results = await knex('workbooks').select('*')
    res.send(results)
  } catch(err) {
    console.error(err)
  } 
})

module.exports = router