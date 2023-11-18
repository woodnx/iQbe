import express from 'express'
import dayjs, { generateRange } from '../plugins/day'
import type { Period } from '../plugins/day'
import knex from '../plugins/knex'
import { db } from '../database'
import { sql } from 'kysely'

const router = express.Router()

router.get('/status/:date/:period', async (req, res) => {
  const userId = req.userId;
  const date = req.params.date;
  const _period = req.params.period;

  const period: Period = (_period == 'week' || _period == 'month') ? _period : 'day';
  const ranges = generateRange(date, period);

  try {
    const results = await Promise.all(
      ranges.map(async (range) => ({
        start: range[0],
        end: range[1],
        right: (await db
          .selectFrom('histories')
          .select(({ fn }) => [ fn.count('quiz_id').as('count') ])
          .where(({ eb, and, between }) => and([
            eb('user_id', '=', userId),
            eb('judgement', '=', 1),
            between('practiced', range[0], range[1]),
          ]))
          .executeTakeFirst()
        )?.count,

        wrong: (await db
          .selectFrom('histories')
          .select(({ fn }) => [ fn.count('quiz_id').as('count') ])
          .where(({ eb, and, between }) => and([
            eb('user_id', '=', userId),
            eb('judgement', '=', 0),
            between('practiced', range[0], range[1]),
          ]))
          .executeTakeFirst()
        )?.count,

        through: (await db
          .selectFrom('histories')
          .select(({ fn }) => [ fn.count('quiz_id').as('count') ])
          .where(({ eb, and, between }) => and([
            eb('user_id', '=', userId),
            eb('judgement', '=', 1),
            between('practiced', range[0], range[1]),
          ]))
          .executeTakeFirst()
        )?.count,
      }))
    );
    res.status(200).send(results);
  } catch(e) {
    console.error(e)
    res.send('An Error Occured')
  }
})

router.get('/ranking/all/:period', async (req, res) => {
  const _period = req.params.period;
  const limit = (!!req.query.limit || Number(req.query.limit) > 5) ? Number(req.query.limit) : 5
  const now = dayjs().format()

  const period: Period = (_period == 'week' || _period == 'month') ? _period : 'day'

  const ranges = generateRange(now, period)

  try {
    const nowRanking = await db.selectFrom('histories')
    .innerJoin('users', 'user_id', 'users.id')
    .select(({ fn }) => [
      sql<number>`ROW_NUMBER() OVER(ORDER BY count DESC)`.as('rank'),
      'histories.user_id as userId',
      'users.nickname as nickname',
      fn.count('histories.quiz_id').as('count'),
    ])
    .where(({ between }) => between('practiced', ranges[0][0], ranges[0][1]))
    .groupBy('user_id')
    .orderBy('rank')
    .limit(limit)
    .execute();

    const prevRanking = await db.selectFrom('histories')
    .innerJoin('users', 'user_id', 'users.id')
    .select(({ fn }) => [
      sql<number>`ROW_NUMBER() OVER(ORDER BY count DESC)`.as('rank'),
      'histories.user_id as userId',
      'users.nickname as nickname',
      fn.count('histories.quiz_id').as('count'),
    ])
    .where(({ between }) => between('practiced', ranges[5][0], ranges[5][1]))
    .groupBy('user_id')
    .orderBy('rank')
    .limit(limit)
    .execute();

    const ranking = nowRanking.map(n => {
      const prev = prevRanking.filter(p => p.userId === n.userId)[0]
      const compare = !!prev ? n.rank - prev.rank : 1

      return {
        ...n,
        compare
      }
    })

    res.status(200).send(ranking)
  }catch(e) {
    console.error(e)
    res.send('An Error Occured')
  }
  
})

router.get('/ranking/personal/:period', async (req, res) => {
  const _period = req.params.period
  const userId = req.userId
  const now = dayjs().format('YYYY-MM-DD HH:mm:ss')

  const period: Period = (_period == 'week' || _period == 'month') ? _period : 'day'

  const ranges = generateRange(now, period)

  try {
    const nowRank = await db
      .selectFrom('histories')
      .innerJoin('users', 'histories.user_id', 'users.id')
      .select(({ fn }) => [
        'users.nickname as name',
        fn.count('histories.quiz_id').as('count'),
      ])
      .where(({ eb, and, between }) => and([
        eb('user_id', '=', userId),
        between('histories.practiced', ranges[6][0], ranges[6][1]),
      ]))
      .groupBy('user_id')
      .execute();

    const prevRank = await db
      .selectFrom('histories')
      .innerJoin('users', 'histories.user_id', 'users.id')
      .select(({ fn }) => [
        'users.nickname as name',
        fn.count('histories.quiz_id').as('count'),
      ])
      .where(({ eb, and, between }) => and([
        eb('user_id', '=', userId),
        between('histories.practiced', ranges[5][0], ranges[5][1]),
      ]))
      .groupBy('user_id')
      .execute();

    const isNodata = (nowRank.length == 0)

    const ranking = {
      rank: nowRank.length,
      name: isNodata ? '' : nowRank[0].name,
      count: isNodata ? 0 : nowRank[0].count,
      compare: nowRank.length - prevRank.length,
      userId,
    }

    res.status(200).send(ranking)
  }catch(e){
    console.error(e)
    res.send('An Error Occured')
  }

})

module.exports = router