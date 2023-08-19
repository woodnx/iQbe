import express from 'express'
import knex from '../knex'

const router = express.Router()

router.get('/', async (req, res) => {
  const quizId = req.query.quizId
  const userId = req.query.userId

  try {
    const fast = await knex('answer_logs')
    .min('pressed_length')
    .where('quiz_id', quizId)

    const avg = await knex('answer_logs')
    .avg('pressed_length')
    .where('quiz_id', quizId)

    const myFast = await knex('answer_logs')
    .min('pressed_length')
    .where('quiz_id', quizId)
    .where('user_id', userId)
    
    res.send({
      fast,
      avg,
      myFast,
    })
  }catch(e) {
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

router.post('/', async (req, res) => {
  const quizId = req.body.quizId
  const userId = req.userId
  const length = req.body.length

  try {
    const data = {
      quiz_id: quizId,
      user_id: userId,
      pressed_length: length
    }

    const inserts = await knex('answer_logs').insert(data)
    const message = `${inserts.length} new lengthes saved`

    console.log(message)
    res.status(201).send(message)
  }catch(e) {
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

module.exports = router