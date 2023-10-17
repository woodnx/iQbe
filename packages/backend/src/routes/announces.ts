import express from 'express'
import data from '../public/announce/now.json'

const router = express.Router()

router.get('/', (req, res) => {
  res.send(data)
})

module.exports = router