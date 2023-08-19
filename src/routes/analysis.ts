import express from 'express'
import dayjs, { generateRange } from '../day'
import type { Period } from '../day'
import knex from '../knex'

const router = express.Router()

router.get('/status/:date/:period', async (req, res) => {
  const userId = req.userId
  const date = req.params.date
  const _period = req.params.period

  const period: Period = (_period == 'week' || _period == 'month') ? _period : 'day'

  const ranges = generateRange(date, period)

  try {
    const results = await Promise.all(
      ranges.map(async (range) => ({
        start: range[0],
        end: range[1],
        right: (await knex('histories')
        .count('quiz_id', {as: 'count'})
        .where('user_id', userId)
        .where('judgement', 1)
        .whereBetween('practiced', [range[0], range[1]]))[0].count,

        wrong: (await knex('histories')
        .count('quiz_id', {as: 'count'})
        .where('user_id', userId)
        .where('judgement', 0)
        .whereBetween('practiced', [range[0], range[1]]))[0].count,

        through: (await knex('histories')
        .count('quiz_id', {as: 'count'})
        .where('user_id', userId)
        .where('judgement', 2)
        .whereBetween('practiced', [range[0], range[1]]))[0].count,
      }))
    )
    res.send(results)
  } catch(e) {
    console.error(e)
    res.send('An Error Occured')
  }
})

router.get('/ranking/all', async (req, res) => {
  const _period = req.query.period　|| 'day'
  const limit = (!!req.query.limit || Number(req.query.limit) > 6) ? Number(req.query.limit) : 6
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

  const period: Period = (_period == 'week' || _period == 'month') ? _period : 'day'

  const ranges = generateRange(now, period)

  try {
    const nowRanking = await knex('histories')
    .select({
      rank: knex.raw('ROW_NUMBER() OVER(ORDER BY count DESC)'),
      userId: 'user_id',
      name: 'nickname',
      count: knex.raw('COUNT(quiz_id)')
    })
    .innerJoin('users', 'user_id', 'users.id')
    .whereBetween('practiced', [ ranges[6][0], ranges[6][1] ])
    .groupBy('user_id')
    .orderBy('rank')
    .limit(limit)

    const prevRanking = await knex('histories')
    .select({
      rank: knex.raw('ROW_NUMBER() OVER(ORDER BY count DESC)'),
      userId: 'user_id',
      name: 'nickname',
      count: knex.raw('COUNT(quiz_id)')
    })
    .innerJoin('users', 'user_id', 'users.id')
    .whereBetween('practiced', [ ranges[5][0], ranges[5][1] ])
    .groupBy('user_id')
    .orderBy('rank')
    .limit(limit)

    const ranking = nowRanking.map(n => {
      const prev = prevRanking.filter(p => p.userId === n.userId)[0]
      const compare = !!prev ? n.rank - prev.rank : 1

      return {
        ...n,
        compare
      }
    })

    res.send(ranking)
  }catch(e) {
    console.error(e)
    res.send('An Error Occured')
  }
  
})

router.get('/ranking/account/', async (req, res) => {
  const _period = req.query.period
  const userId = req.userId
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

  const period: Period = (_period == 'week' || _period == 'month') ? _period : 'day'

  const ranges = generateRange(now, period)

  try {
    const nowRank = await knex('histories')
    .select({
      name: 'nickname',
      count: knex.raw('COUNT(quiz_id)')
    })
    .innerJoin('users', 'histories.user_id', 'users.id')
    .whereBetween('practiced', [ranges[6][0], ranges[6][1]])
    .groupBy('user_id')
    .having('count', '>=', 
      knex('histories')
      .count('quiz_id', { as: 'count' })
      .where('user_id', userId)
      .whereBetween('practiced', [ranges[6][0], ranges[6][1]])
      .groupBy('user_id')
    )

    const prevRank = await knex('histories')
    .select({
      name: 'nickname',
      count: knex.raw('COUNT(quiz_id)')
    })
    .innerJoin('users', 'histories.user_id', 'users.id')
    .whereBetween('practiced', [ranges[5][0], ranges[5][1]])
    .groupBy('user_id')
    .having('count', '>=', 
      knex('histories')
      .count('quiz_id', { as: 'count' })
      .where('user_id', userId)
      .whereBetween('practiced', [ranges[5][0], ranges[5][1]])
      .groupBy('user_id')
    )

    const isNodata = (nowRank.length == 0)

    const ranking = {
      rank: nowRank.length,
      name: isNodata ? '' : nowRank[0].name,
      count: isNodata ? 0 : nowRank[0].count,
      compare: nowRank.length - prevRank.length
    }

    res.send(ranking)
  }catch(e){
    console.error(e)
    res.send('An Error Occured')
  }

})

module.exports = router