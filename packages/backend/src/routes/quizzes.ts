import express, { Router, Request } from 'express'
import { sql } from 'kysely';
import knex from '../knex';
import dayjs from 'dayjs';
import { db } from '../database';
import { Timestamp } from '../db/types';

const router: Router = express.Router()

type KeywordOption = "1" | "2" | "3" 

interface QuizRequest extends Request { 
  query: {
    page?: string,
    perPage?: string,
    seed?: string,
    workbook?: string[],
    level?: string[],
    keyword: string,
    keywordOption: KeywordOption,
    crctAnsRatio?: [string, string],
    since?: string,
    until?: string,
    judgement?: string[],
    mylistId?: string,
  }
}

interface Quizzes {
  id: number,
  question: string,
  answer: string,
  workbook: string,
  level: string,
  date: string,
}

router.get('/:listName?', async (req: QuizRequest, res) => {
  const page     = !!req.query.page     ? Number(req.query.page)    : 1
  const maxView  = !!req.query.perPage || Number(req.query.perPage) <= 100  ? Number(req.query.perPage) : 100
  const seed     = !!req.query.seed     ? Number(req.query.seed)    : undefined
  const workbook = !!req.query.workbook ? req.query.workbook.map(v => Number(v)) : undefined
  const level    = !!req.query.level    ? req.query.level.map(v => Number(v))    : undefined
  const keyword  = req.query.keyword
  const keywordOption = Number(req.query.keywordOption) || undefined
  const crctAnsRatio = req.query.crctAnsRatio
  const since = req.query.since
  const until = req.query.until
  const judgement = req.query.judgement
  const mylistId = req.query.mylistId

  const userId = req.userId
  const listName = req.params.listName

  try {
    let query = db.selectFrom('quizzes')
    .innerJoin('workbooks', 'quizzes.workbook_id', 'workbooks.id')
    .innerJoin('levels', 'workbooks.level_id', 'levels.id')
    //.leftJoin('histories', 'histories.quiz_id', 'quizzes.id')
    .select(({ fn, val, ref }) => [
      'quizzes.id as id',
      'quizzes.que as question',
      'quizzes.ans as answer',
      'workbooks.name as workbook', 
      'workbooks.date as date',
      'levels.color as level',
      fn.countAll<number>().over().as('size'),
    ]
      // knex('histories')
      // .count('*')
      // .where('histories.quiz_id', quizzesIdColumnIdentifier)
      // .as('total'),

      // knex('histories')
      // .count('*')
      // .where('histories.quiz_id', quizzesIdColumnIdentifier)
      // .where('judgement', 1)
      // .as('rights'),

      //{ total: knex.raw('quizzes.total_crct_ans + quizzes.total_wrng_ans + quizzes.total_through_ans')},
    )

    if (!!workbook) query = query.where('workbooks.id', 'in', workbook);
    if (!!level)    query = query.where('levels.id', 'in', level);
    if (!!seed)     query = query.orderBy(sql`RAND(${seed})`);
    if (!!keyword && !!keywordOption) {
      // const brackets = keyword.split(/\(\s\)/g)
      // const ands = keyword.split(/\s+/g)
      // const ors = keyword.split(/\++/g)
      
      if (keywordOption === 1) {
        query = query.where((eb) => eb.or([
          eb('quizzes.que', 'ilike', `%${keyword}%`),
          eb('quizzes.ans', 'ilike', `%${keyword}%`)
        ]));
      }
      else if (keywordOption === 2) { 
        query = query.where('quizzes.que', 'ilike', `%${keyword}%`);
      }
      else { 
        query = query.where('quizzes.ans', 'ilike', `%${keyword}%`)
      }
    }
    // if (!!crctAnsRatio) {
    //   builder.whereRaw(
    //    `(SELECT COUNT(*) FROM histories WHERE histories.quiz_id = quizzes.id AND judgement = 1) / 
    //     (SELECT COUNT(*) FROM histories WHERE histories.quiz_id = quizzes.id) * 100
    //     BETWEEN ? AND ?`
    //   , [crctAnsRatio[0], crctAnsRatio[1]])
    // }
    if (listName === 'favorite') {
      query = query
      .innerJoin('favorites', 'favorites.quiz_id', 'quizzes.id')
      .where('favorites.user_id', '=', userId)
      .orderBy('favorites.registered desc'); 
    } 
    else if (listName === 'history' && !!since && !!until) {
      const s = dayjs(Number(since)).toDate();
      const u = dayjs(Number(until)).toDate();
      
      query = query
      .innerJoin('histories', 'histories.quiz_id', 'quizzes.id')
      .select([
        'histories.judgement as judgement',
        'histories.practiced as practiced',
      ])
      .where('histories.user_id', '=', userId)
      .where(({ between }) => between('histories.practiced', s, u));
    } 
    else if (listName === 'mylist') {
      query = query
      .innerJoin('mylists_quizzes', 'mylists_quizzes.quiz_id', 'quizzes.id')
      .innerJoin('mylists', 'mylists.id', 'mylists_quizzes.mylist_id')
      .where('mylists.mid', '=', mylistId || "")
      .where('mylists.user_id', '=',userId)
      .orderBy('mylists_quizzes.registered desc');
    }
    
    // execute
    const quizzes = await query
    .limit(maxView)
    .offset(maxView*(page - 1))
    .execute();

    const favorites = await knex('favorites')
    .select('quiz_id')
    .where('user_id', userId)

    const mylists = await knex('mylists_quizzes')
    .select('quiz_id', 'mylist_id')
    .innerJoin('mylists', 'mylists_quizzes.mylist_id', 'mylists.id')
    .where('mylists.user_id', userId)

    const data = await Promise.all(
      quizzes.map(async quiz => {
        const total = await knex('histories')
        .count('*', {as: 'total'})
        .where('quiz_id', quiz.id).first()

        const right = await knex('histories')
        .count('*', {as: 'right'})
        .where('quiz_id', quiz.id)
        .andWhere('judgement', 1).first()

        const isFavorite = favorites.some(f => f.quiz_id == quiz.id)
        const registerdMylist = mylists.filter(m => m.quiz_id == quiz.id).map(m => m.mylist_id)

        return {
          ...quiz,
          ...total,
          ...right,
          isFavorite,
          registerdMylist,
        }
      }
    ))

    //console.log(data)
    
    res.status(200).send(data)
  } catch(e) {
    console.log('An Error Occurred')
    console.error(e)
  }
})

module.exports = router