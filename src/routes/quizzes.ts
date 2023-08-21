import express, { Router, Request } from 'express'
import knex from '../knex'
import dayjs from 'dayjs'

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

  const userId = req.userId
  const listName = req.params.listName

  //console.log(req.query)

  try {
    const quizzesIdColumnIdentifier = knex.ref('quizzes.id');

    const quizzes: Array<Quizzes> = await knex('quizzes')
    .select(
      { id: 'quizzes.id' },
      { question: 'que' },
      { answer: 'ans' },
      { workbook: 'workbooks.name' }, 
      { date: 'workbooks.date' },
      { level: 'levels.color' },
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

      knex.raw('COUNT(*) OVER() as size')
    )
    .innerJoin('workbooks', 'quizzes.workbook_id', 'workbooks.id')
    .innerJoin('levels', 'workbooks.level_id', 'levels.id')
    //.leftJoin('histories', 'histories.quiz_id', 'quizzes.id')
    .modify(async (builder) => {
      if (!!workbook) builder.whereIn('workbook_id', workbook)
      if (!!level)    builder.whereIn('level_id', level)
      if (!!seed)     builder.orderByRaw('RAND(?)', seed)

      if (!!keyword && !!keywordOption) {
        // const brackets = keyword.split(/\(\s\)/g)
        // const ands = keyword.split(/\s+/g)
        // const ors = keyword.split(/\++/g)
        
        if (keywordOption === 1) {
          builder
          .whereILike('que', `%${keyword}%`)
          .orWhereILike('ans', `%${keyword}%`)
        }
        else if (keywordOption === 2) { 
          builder.whereILike('que', `%${keyword}%`)
        }
        else { 
          builder.whereILike('ans', `%${keyword}%`)
        }
      }
      // if (!!crctAnsRatio) {
      //   builder.whereRaw(
      //    `(SELECT COUNT(*) FROM histories WHERE histories.quiz_id = quizzes.id AND judgement = 1) / 
      //     (SELECT COUNT(*) FROM histories WHERE histories.quiz_id = quizzes.id) * 100
      //     BETWEEN ? AND ?`
      //   , [crctAnsRatio[0], crctAnsRatio[1]])
      // }

      if (!listName) {
        // Do Nothing
      }else if (listName === 'favorite') {
        builder
        .innerJoin('favorites', 'favorites.quiz_id', 'quizzes.id')
        .where('favorites.user_id', userId)
        .orderBy('favorites.registered', 'desc')
      }else if (listName === 'history' && !!since && !!until) {
        const s = dayjs(Number(since)).format('YYYY-MM-DD HH:mm:ss');
        const u = dayjs(Number(until)).format('YYYY-MM-DD HH:mm:ss');
        builder.column(
          { judgement: 'histories.judgement' },
          { practiced: 'histories.practiced' },
        )
        .innerJoin('histories', 'histories.quiz_id', 'quizzes.id')
        .where('histories.user_id', userId)
        .whereBetween('histories.practiced', [s, u])

        if (!!judgement) builder.whereIn('histories.judgement', judgement)
      }else {
        builder
        .innerJoin('mylists_quizzes', 'mylists_quizzes.quiz_id', 'quizzes.id')
        //.innerJoin('mylist_informations', 'mylist_informations.')
      }

      //console.log(builder.toSQL())
    })
    .limit(maxView)
    .offset(maxView*(page - 1))
    //.groupBy('quizzes.id')

    const favorites = await knex('favorites')
    .select('quiz_id')
    .where('user_id', userId)

    const mylists = await knex('mylists_quizzes')
    .select('quiz_id', 'mylist_id')
    .innerJoin('mylist_informations', 'mylists_quizzes.mylist_id', 'mylist_informations.id')
    .where('mylist_informations.user_id', userId)

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
    
    res.send(data)
  } catch(e) {
    console.log('An Error Occurred')
    console.error(e)
  }
})

module.exports = router