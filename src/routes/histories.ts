import express, { Router } from 'express'
import knex from '../knex'
import dayjs from '../day'

interface SendData {
  right: number | string;
  wrong: number | string;
  through: number | string;
}

const router: Router = express.Router()

router.get('/:since/:until', async (req, res) => {
  const since = dayjs(Number(req.params.since)).format('YYYY-MM-DD HH:mm:ss');
  const until = dayjs(Number(req.params.until)).format('YYYY-MM-DD HH:mm:ss');
  const user_id = req.userId;

  try {
    const results = await Promise.all(
      [0, 1, 2].map(async i => (await knex('histories')
        .count('quiz_id', {as: 'count'})
        .where('user_id', user_id)
        .andWhere('judgement', i)
        .andWhereBetween('practiced', [ since, until ])
        .first())?.count
    ));
    
    const data: SendData = {
      right: results[1] || 0,
      wrong: results[0] || 0,
      through: results[2] || 0,
    };

    res.status(200).send(data);
  } catch(e) {
    console.error(e)
  }
})

router.post('/', async (req, res) => {
  const quiz_id: number = req.body.quizId
  const judgement: number = req.body.judgement
  const practiced: string = dayjs().format('YYYY-MM-DD HH:mm:ss')

  if (!quiz_id || judgement >= 3 || judgement < 0) {
    res.status(400).send('Undefined list name or judgement')
    return
  }

  try {
    const user_id = req.userId

    await knex.transaction(async trx => {
      
      const data = {
        quiz_id,
        user_id,
        practiced,
        judgement
      }

      const inserts = await trx('histories').insert(data)

      const message = `${inserts.length} new histories saved`
      
      res.status(201).send(message)
      console.log(message)
    })
  } catch(e) {
    console.error(e)
    res.status(400).send('An Error Occured')
  }
})

module.exports = router