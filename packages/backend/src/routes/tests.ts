import express from 'express'
import knex from '../knex'
import dayjs from '../day'

const router = express.Router()

router.get('/quiz', async (req, res) => {
  const quizId = Number(req.query.quizId)
  const testId = Number(req.query.testId)

  try {
    const tests = await knex('test_quizzes')
    .select('ans')
    .innerJoin('quizzes', 'test_quizzes.original_quiz_id', 'quizzes.id')
    .where('test_id', testId)
    .where('quiz_id', quizId)
    
    const data = tests.map((test) => ({
      ...test,
      audio_url: `audio/${quizId}.wav`
    }))
    res.send(data)
  }catch(e){
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

router.get('/experience', async (req, res) => {
  const userId = req.query.userId

  try {
    const exp = await knex('tests_results')
    .where('user_id', userId)
    .groupBy('user_id')
    
    res.send(exp)
  } catch(e) {
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

router.get('/tested', async (req, res) => {
  const userId = req.body.userId
  const testId = req.body.testId

  try {
    const tested = await knex('tests_results')
    .select('quiz_id')
    .where('user_id', userId)
    .where('test_id', testId)
    .distinct()

    res.send(tested)
  } catch(e) {
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

router.post('/', async (req, res) => {
  const testId = req.body.testId
  const quizId = req.body.quizId
  const userId = req.body.userId
  const judgement = req.body.judgement
  const pressedTime = req.body.pressedTime
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

  try {
    const data = {
      test_id: testId,
      quiz_id: quizId,
      user_id: userId,
      tested: now,
      pressed_time: pressedTime,
      judgement,
    }

    const insters = await knex('tests_results').insert(data)
    const message = `${insters.length} new results saved`

    console.log(message)
    res.status(201).send(message)
  }catch(e){
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

module.exports = router