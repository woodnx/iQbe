import express, { Router } from 'express'
import knex from '../knex'
import dayjs from '../day'

const router: Router = express.Router()

router.get('/', async (req, res) => {
  const userId = req.userId;
  try {
    const all = await knex('mylist_informations')
    .select('name', 'id')
    .where('user_id', userId)
    
    res.status(200).send(all)
  } catch(e) {
    console.error(e)
  }
})

router.post('/', async (req, res) => {
  const listName = req.body.listName
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

  if (!listName) {
    res.status(400).send('Undefined list name')
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
        user_id,
        name: listName,
        created: now,
        attr: 100
      }

      const inserts = await trx('mylist_informations').insert(data)
      const message = `${inserts.length} new mylists saved (user: ${user_id})`
      
      res.status(201).send(message)
      console.log(message)
    })
  } catch(e) {
    res.status(400).send('An Error Occured')
    console.error(e)
  }
})

router.put('/quiz', async (req, res) => {
  const quiz_id = req.body.quizId
  const mylist_id = req.body.mylistId
  const registered = dayjs().format('YYYY-MM-DD HH:mm:ss')
  
  if (!quiz_id || !mylist_id) {
    res.status(400).send('Undefined quiz id or mylist id')
    return
  }

  const data = {
    quiz_id,
    mylist_id,
    registered
  }

  try {
    await knex.transaction(async trx => {
      const inserts = await trx('mylists_quizzes').insert(data)

      const message = `${inserts.length} new quizzes saved into mylist (mylist: ${mylist_id})`
      res.status(201).send(message)
    })
  } catch(e) {
    res.status(400).send('An Error Occurd')
    console.error(e)
  }
})

router.put('/rename', async (req, res) => {
  const mylistId = req.body.mylistId
  const userId = req.body.userId
  const newName = req.body.newName

  if (!userId || !mylistId || !newName) {
    res.status(400).send(`Undefined user id or mylist id or mylist's name`)
    return
  }

  try {
    await knex.transaction(async trx => {
      const inserts = await trx('mylist_informations')
      .update('name', newName)
      .where('id', mylistId)

      const allList = await trx('mylist_informations')
      .select('name', 'id')
      .where('user_id', userId)

      res.status(200).send(allList)
    })
  } catch(e) {
    res.status(400).send('An Error Occurd')
    console.error(e)
  }
})

router.delete('/quiz', async (req, res) => {
  const quizId = req.body.quizId
  const mylistId = req.body.mylistId

  try {
    await knex.transaction(async trx => {
      const deletes = await trx('mylists_quizzes').del()
      .where('mylist_id', mylistId)
      .where('quiz_id', quizId)

      res.status(204).send()
    })

  }catch(e) {
    res.status(400).send('An Error Occured')
    console.error(e)
  }
})

router.delete('/list', async (req, res) => {
  const mylistId = req.body.mylistId
  const userId = req.body.userId

  
  try {
    await knex.transaction(async trx => {
      await trx('mylists_quizzes')
      .del()
      .where('mylist_id', mylistId)

      await trx('mylist_informations')
      .del()
      .where('mylist_id', mylistId)

      const allList = await trx('mylist_informations')
      .select('name', 'id')
      .where('user_id', userId)

      res.status(200).send(allList)
    })
  }catch(e) {
    console.log(e)
    res.status(400).send('An Error Occured')
  }
})

module.exports = router