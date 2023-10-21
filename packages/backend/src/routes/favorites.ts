import express from 'express'
import dayjs from '../plugins/day'
import knex from '../plugins/knex'

const router = express.Router()

router.post('/', async (req, res) => {
  const userId = req.userId
  const quizId = req.body.quizId
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

  try {
    const data = {
      user_id: userId,
      quiz_id: quizId,
      registered: now,
    }

    const insterts = await knex('favorites').insert(data)
    const message = `${insterts.length} new quizzes saved`
    
    res.status(201).send(message)
    console.log(message)
  }catch(e){
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

router.delete('/', async (req, res) => {
  const userId = req.userId
  const quizId = req.body.quizId

  try {
    const deleted = await knex('favorites').del()
    .where('user_id', userId)
    .where('quiz_id', quizId)

    res.status(204).send()
  } catch(e) {
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

module.exports = router