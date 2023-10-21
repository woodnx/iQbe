import express, { Router } from 'express'
import { writeFileSync } from 'fs'
import path from 'path'
import knex from '../plugins/knex'
import dayjs from '../plugins/day'

const router: Router = express.Router()

router.put('/login', async (req, res) => {
  try {
    const uid = req.user.uid
    const authTime = req.user.auth_time

    const created = dayjs(authTime * 1000).format('YYYY-MM-DD HH:mm:ss')
    const modified = dayjs().format('YYYY-MM-DD HH:mm:ss')

    await knex.transaction(async trx => {
      const user = await trx('users').select('*').where("uid", uid).first()

      if (!!user) {
        const photo_url = `/photo/${user.id}`
        const data = {...user, photo_url}

        const updates = await trx('users').update({modified}).where("uid", uid)

        res.send(data)
        console.log(`${updates} new users updated`)
      }
      else {
        const inserts = await trx('users').insert({uid, modified, created})
        const user = await trx('users').select('*').where("uid", uid).first()

        res.send(user)
        console.log(`${inserts.length} new users saved`)
      }
    })
  } catch(e) {
    console.error(e)
  }
})

router.post('/signup', async (req, res) => {
  const uid = req.user.uid
  const nickname = req.body.nickname

  if (!nickname) {
    res.status(401).send('undefined nickname');
    return;
  }

  try {
    await knex.transaction(async trx => {
      const updates = await trx('users').update({nickname}).where("uid", uid)
      const user = await trx('users').select('*').where("uid", uid).first()

      res.send(user)
      console.log(`${updates} new users updated`)
    })
  } catch(e) {
    console.error(e)
  }
})

router.put('/rename', async (req, res) => {
  const uid = req.user.uid
  const newName = req.body.newName

  if (!newName) {
    res.status(401).send('undefined nickname');
    return;
  }

  try {
    await knex.transaction(async trx => {
      const updates = await trx('users').update({nickname: newName}).where("uid", uid)
      const user = await trx('users').select('*').where("uid", uid).first()

      res.send(user)
      console.log(`${updates} new users updated`)
    })
  } catch(e) {
    console.error(e)
  }
})

router.put('/photo', async (req, res) => {
  const uid = req.user.uid
  const image = req.body.image

  if (!image) {
    res.status(401).send('undefined image')
    return;
  }
  
  try {
    const userId = await knex('users').select('id').where("uid", uid).first()

    const imagepath = path.join(__dirname, 'public', userId)
    writeFileSync(imagepath, image.toString())
    
    res.send(imagepath)
    console.log(`1 new user updated`)
  }catch(err) {
    console.error(err)
  }
})

module.exports = router