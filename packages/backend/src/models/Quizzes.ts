import { db } from "@/database";
import dayjs from "dayjs";
import { sql } from "kysely";

export type FindMany = { 
  page: number,
  maxView: number,
  seed?: number,
  workbook?: string[] | null,
  level?: number[]  | null,
  keyword?: string | null,
  keywordOption?: number | null,
  crctAnsRatio?: number[] | null,
  since?: string | null,
  until?: string | null,
  judgement?: number[] | null,
  mid?: string,
};

export type QuizzesPaths = "favorite" | "history" | "mylist" | "create";

type InsertData = {
  que: string,
  ans: string,
  creator_id: number,
  workbook_id: number,
}

export default {
  find(id: number) {
    return db.selectFrom('quizzes')
    .leftJoin('workbooks', 'quizzes.workbook_id', 'workbooks.id')
    .leftJoin('levels', 'workbooks.level_id', 'levels.id')
    .innerJoin('users', 'users.id', 'quizzes.creator_id')
    .leftJoin('quizzes_categories', 'quizzes_categories.quiz_id', 'quizzes.id')
    .leftJoin('quiz_visible_users', 'quiz_visible_users.quiz_id', 'quizzes.id')
    .select(({ fn }) => [
      'quizzes.id as id',
      'quizzes.que as question',
      'quizzes.ans as answer',
      'workbooks.name as workbook', 
      'workbooks.wid as wid', 
      'workbooks.date as date',
      'levels.color as level',
      'users.uid as creatorId',
      'quizzes_categories.category_id as category',
      'quizzes_categories.sub_category_id as subCategory',
      'quizzes.total_crct_ans as right',
      sql<number>`total_crct_ans + total_through_ans + total_wrng_ans`.as('total'),
      fn.countAll<number>().over().as('size'),
    ])
    .where('quizzes.id', '=', id)
    .executeTakeFirstOrThrow();
  },

  async findMany(
    userId: number, 
    {
      page,
      maxView,
      seed,
      workbook,
      level,
      keyword,
      keywordOption,
      crctAnsRatio,
      since,
      until,
      judgement,
      mid,
    }: FindMany, 
    path?: QuizzesPaths
  ) {
    let query = db.selectFrom('quizzes')
    .leftJoin('workbooks', 'quizzes.workbook_id', 'workbooks.id')
    .leftJoin('levels', 'workbooks.level_id', 'levels.id')
    .innerJoin('users', 'users.id', 'quizzes.creator_id')
    .leftJoin('quizzes_categories', 'quizzes_categories.quiz_id', 'quizzes.id')
    .leftJoin('quiz_visible_users', 'quiz_visible_users.quiz_id', 'quizzes.id')
    .select(({ fn }) => [
      'quizzes.id as id',
      'quizzes.que as question',
      'quizzes.ans as answer',
      'workbooks.name as workbook', 
      'workbooks.wid as wid', 
      'workbooks.date as date',
      'levels.color as level',
      'users.uid as creatorId',
      'quizzes_categories.category_id as category',
      'quizzes_categories.sub_category_id as subCategory',
      'quizzes.total_crct_ans as right',
      sql<number>`total_crct_ans + total_through_ans + total_wrng_ans`.as('total'),
      fn.countAll<number>().over().as('size'),
    ])
    .where(({ eb, or }) => or([
      eb('quiz_visible_users.user_id', 'is', null),
      eb('quiz_visible_users.user_id', '=', userId),
    ]));

    if (!!workbook) query = query.where('workbooks.wid', 'in', workbook);
    if (!!level)    query = query.where('levels.id', 'in', level);
    if (!!seed)     query = query.orderBy(sql`RAND(${seed})`);
    if (!!keyword && !!keywordOption) {
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

    if (path == 'favorite') {
      query = query
      .innerJoin('favorites', 'favorites.quiz_id', 'quizzes.id')
      .where('favorites.user_id', '=', userId)
      .orderBy('favorites.registered desc'); 
    }
    else if (path === 'history' && !!since && !!until) {
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
      ))
      .orderBy('histories.practiced desc');
    }
    else if (path === 'create') {
      query = query
      .where('quizzes.creator_id', '=', userId)
    }
    else if (path === 'mylist' && !!mid) {
      query = query
      .innerJoin('mylists_quizzes', 'mylists_quizzes.quiz_id', 'quizzes.id')
      .innerJoin('mylists', 'mylists.id', 'mylists_quizzes.mylist_id')
      .where('mylists.mid', '=', mid)
      .where('mylists.user_id', '=', userId)
      .orderBy('mylists_quizzes.registered desc');
    }
    
    // execute
    return query
    .limit(maxView)
    .offset(maxView*(page - 1))
    .execute();
  },

  async create(data: InsertData) {
    return db.insertInto('quizzes')
    .values(data)
    .execute();
  }
}