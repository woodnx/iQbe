import express, { Router } from 'express'
import knex from '../knex'
import dayjs from '../day'

interface SendData {
  right: number | string;
  wrong: number | string;
  through: number | string;
}

const router: Router = express.Router()

router.get('/:user_id/:start/:end', async (req, res) => {
  const start   = `${req.params.start} 00:00:00`
  const end     = `${req.params.end} 23:59:59`
  const user_id = Number(req.params.user_id)

  try {
    const results = await Promise.all(
      [0, 1, 2].map(async i => {
        const r = await knex('histories')
        .count('quiz_id', {as: 'count'})
        .where('user_id', user_id)
        .andWhere('judgement', i)
        .andWhereBetween('practiced', [ start, end ])
        .first()
        
        return !!r ? r.count : 0 
      }))
    
    const data: SendData = {
      right: results[1],
      wrong: results[0],
      through: results[2],
    }

    res.send(data)
  } catch(e) {
    console.error(e)
  }
})

router.post('/', async (req, res) => {
  const quiz_id: number = req.body.quizId
  const judgement: number = req.body.judgement
  const practiced: string = dayjs().format('YYYY-MM-DD HH:mm:ss')

  if (!quiz_id || !judgement) {
    res.status(400).send('Undefined list name or judgement')
    return
  }

  try {
    const uid = req.user.uid

    await knex.transaction(async trx => {
      const user_id: number = await trx('users')
      .select('id')
      .where("uid", uid)
      .first()

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