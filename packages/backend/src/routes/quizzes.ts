import express, { Router, Request } from 'express'
import { sql } from 'kysely';
import dayjs from 'dayjs';
import { db } from '@/database';

const router: Router = express.Router();

type KeywordOption = "1" | "2" | "3"; 

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
};

router.get('/:listName?', async (req: QuizRequest, res) => {
  const page     = !!req.query.page     ? Number(req.query.page)    : 1;
  const maxView  = !!req.query.perPage || Number(req.query.perPage) <= 100  ? Number(req.query.perPage) : 100;
  const seed     = !!req.query.seed     ? Number(req.query.seed)    : undefined;
  const workbook = req.query.workbook;
  const level    = !!req.query.level    ? req.query.level.map(v => Number(v))    : undefined;
  const keyword  = req.query.keyword;
  const keywordOption = Number(req.query.keywordOption) || undefined;
  const crctAnsRatio = !!req.query.crctAnsRatio ? req.query.crctAnsRatio.map(v => Number(v)) : undefined;
  const since = req.query.since;
  const until = req.query.until;
  const judgement = !!req.query.judgement ? req.query.judgement.map(v => Number(v)) : undefined;
  const mylistId = req.query.mylistId;

  const userId = req.userId;
  const listName = req.params.listName;

  try {
    let query = db.selectFrom('quizzes')
    .leftJoin('workbooks', 'quizzes.workbook_id', 'workbooks.id')
    .leftJoin('levels', 'workbooks.level_id', 'levels.id')
    .select(({ fn }) => [
      'quizzes.id as id',
      'quizzes.que as question',
      'quizzes.ans as answer',
      'workbooks.name as workbook', 
      'workbooks.date as date',
      'levels.color as level',
      fn.countAll<number>().over().as('size'),
    ]
      //{ total: knex.raw('quizzes.total_crct_ans + quizzes.total_wrng_ans + quizzes.total_through_ans')},
    );

    if (!!workbook) query = query.where('workbooks.wid', 'in', workbook);
    if (!!level)    query = query.where('levels.id', 'in', level);
    if (!!seed)     query = query.orderBy(sql`RAND(${seed})`);
    if (!!keyword && !!keywordOption) {
      // const brackets = keyword.split(/\(\s\)/g)
      // const ands = keyword.split(/\s+/g)
      // const ors = keyword.split(/\++/g)
      
      if (keywordOption === 1) {
        query = query.where((eb) => eb.or([
          eb('quizzes.que', 'like', `%${keyword}%`),
          eb('quizzes.ans', 'like', `%${keyword}%`)
        ]));
      }
      else if (keywordOption === 2) { 
        query = query.where('quizzes.que', 'like', `%${keyword}%`);
      }
      else { 
        query = query.where('quizzes.ans', 'like', `%${keyword}%`)
      }
    }
    if (!!crctAnsRatio) {
      query = query.where(sql`quiz.total_crct_ans / (quiz.total_crct_ans + quiz.total_wrng_ans + quiz.total_through_ans) * 100 BETWEEN ${crctAnsRatio[0]} AND ${crctAnsRatio[1]}`)
    }
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
      .where(({ eb, and, between }) => (
        !!judgement 
        ?
        and([
          eb('histories.judgement', 'in', judgement),
          between('histories.practiced', s, u)
        ])
        : 
        between('histories.practiced', s, u)
      ));
    }
    else if (listName === 'create') {
      query = query
      .where('quizzes.creator_id', '=', userId)
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

    const favorites = await db
    .selectFrom('favorites')
    .select('quiz_id')
    .where('user_id', '=', userId)
    .execute();

    const mylists = await db
    .selectFrom('mylists_quizzes')
    .innerJoin('mylists', 'mylists_quizzes.mylist_id', 'mylists.id')
    .select(['quiz_id', 'mylist_id'])
    .where('mylists.user_id', '=', userId)
    .execute();

    const data = await Promise.all(
      quizzes.map(async quiz => {
        const total = await db
        .selectFrom('histories')
        .select(({ fn }) => [
          fn.count('quiz_id').as('total')
        ])
        .where('quiz_id', '=', quiz.id)
        .executeTakeFirst();

        const right = await db
        .selectFrom('histories')
        .select(({ fn }) => [
          fn.count('quiz_id').as('right')
        ])
        .where(({ eb, and }) => and([
          eb('quiz_id', '=', quiz.id),
          eb('judgement', '=', 1),
        ]))
        .executeTakeFirst();

        const isFavorite = favorites.some(f => f.quiz_id == quiz.id);
        const registerdMylist = mylists.filter(m => m.quiz_id == quiz.id).map(m => m.mylist_id);

        return {
          ...quiz,
          ...total,
          ...right,
          isFavorite,
          registerdMylist,
        };
    }));

    res.status(200).send(data)
  } catch(e) {
    console.log('An Error Occurred')
    console.error(e)
  }
});

router.post('/', async (req, res) => {
  const question: string | undefined = req.body.question;
  const answer: string | undefined = req.body.answer;
  const isPrivate: boolean = !(req.body.visible);
  const category = req.body.category;
  const subCategory = req.body.subCategory;
  const workbook = req.body.workbook;
  const limitedUser: number[] = req.body.limitedUser;
  const userId = req.userId;

  if (!question || !answer) {
    res.send('no body parameter');
    return;
  }
  
  await db.transaction().execute(async (trx) => {
    const workbookId = (await trx
    .selectFrom('workbooks')
    .select('id')
    .where('wid', '=', workbook)
    .executeTakeFirst())?.id;

    await trx.insertInto('quizzes')
    .values({
      que: question,
      ans: answer,
      creator_id: userId,
      workbook_id: workbookId,
    })
    .executeTakeFirst();

    const createdQuiz = await trx.selectFrom('quizzes').select('id')
    .where(({eb, and}) => and([
      eb('que', '=', question),
      eb('ans', '=', answer),
    ]))
    .executeTakeFirstOrThrow();

    if (!!category && !!subCategory) {
      await trx.insertInto('quizzes_categories')
      .values({
        quiz_id: createdQuiz.id,
        category_id: category,
        sub_category_id: subCategory,
        user_id: userId,
      })
      .executeTakeFirst();
    }

    const { id: quizId } = await trx.selectFrom('quizzes')
    .select('id')
    .where('que', '=', question)
    .executeTakeFirstOrThrow();

    if (isPrivate) {
      const visibleUser = limitedUser || [ userId ];

      visibleUser.forEach(userId => {
        trx.insertInto('quiz_visible_users')
        .values({
          quiz_id: quizId,
          user_id: userId,
        });
      });
    }

    res.send({ message: 'Successfully submitted' })
    return;
  });
});

module.exports = router