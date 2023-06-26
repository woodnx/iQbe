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

router.get('/color', async (req, res) => {
  try {
    const results = await knex('workbooks')
    .select(
      { id: 'workbooks.id' },
      { label: 'workbooks.name' }, 
      { color: 'levels.color' }
    )
    .innerJoin('levels', 'workbooks.level_id', 'levels.id')

    res.send(results)
  } catch(err) {
    console.error(err)
  } 
})

module.exports = router