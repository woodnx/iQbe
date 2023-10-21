import express from 'express'
import knex from '../plugins/knex'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const categories = await knex('categories').select('*')
    res.send(categories)
  } catch(e) {
    console.error(e)
    res.send('An Error Occured')
  }
})

router.get('/sub', async (req, res) => {
  try {
    const categories = await knex('sub_categories').select('*')
    res.send(categories)
  } catch(e) {
    console.error(e)
    res.send('An Error Occured')
  }
})

router.post('/quiz', async (req, res) => {
  const quizId = req.body.quizId
  const category = Number(req.body.category)
  const subCategory = category !== 0 ? Number(req.body.subcategory) : 0
  const userId = req.body.userId

  try {
    await knex.transaction(async trx => {
      const registerd = await trx('quizzes_categories').select('*')
      if (!registerd.filter(data => data.quizId === quizId)) {
        const inserts = await trx('quizzes_categories')
        .insert({
          quiz_id: quizId,
          sub_category: subCategory,
          user_id: userId,
          category,
        })

        const message = `${inserts.length} new categories saved`
        res.status(201).send(message)
        console.log(message)
      }
    })
  }catch(e) {
    console.error(e)
    res.status(400).send('An Error Occured')
  }

})

module.exports = router