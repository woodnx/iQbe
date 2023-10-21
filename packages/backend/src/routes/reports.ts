import express from 'express'
import knex from '../plugins/knex'
import dayjs from '../plugins/day'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const quizzes = await knex('quizzes')
    .select('id', 'quiz', 'ans')
    .whereExists(query => {
      query.select('id').from('quiz_reports')
      .where('quiz_reports.quiz_id', '=', 'quizzes.id')
    })
    res.send(quizzes)
  } catch(e) {
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

router.post('/', async (req, res) => {
  const quizId = req.body.quizId
  const userId = req.body.userId
  const reason = req.body.reason
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

  try {
    const data = {
      quiz_id: quizId,
      user_id: userId,
      registered: now,
      reason,
    }

    const inserts = await knex('quiz_reports').insert(data)
    const message = `${inserts.length} new reports saved`

    console.log(message)
    res.status(201).send(message)
  }catch(e){
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

router.delete('/', async (req, res) => {
  const id = req.body.quizId
  
  try {
    await knex('quiz_reports').del().where('quiz_id', id)
    res.status(204).send()
  }catch(e) {
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

module.exports = router