import { db } from "@/database";
import { DB } from "@/db/types";
import { createError } from "@/plugins/createError";
import { format } from "@/plugins/day";
import { createFavorite, removeFavorite } from "@/services/FavoritesService";
import { createHistory } from "@/services/HistoriesService";
import QuizzesService from "@/services/QuizzesService";
import { typedAsyncWrapper } from "@/utils";
import dayjs from "dayjs";
import { Transaction } from "kysely";

const limitedUserIds = (trx: Transaction<DB>,limitedUserUid: string[]) => (
  Promise.all(limitedUserUid.map(async (user) => {
    return (await trx.selectFrom('users').select('id').where('uid', '=', user).executeTakeFirstOrThrow()).id
  }))
);

export default {
  get: typedAsyncWrapper<"/quizzes", "get">(async (req, res) => {
    if (!req.query) return;
  
    const page     = !!req.query.page     ? Number(req.query.page)    : 1;
    const maxView  = !!req.query.maxView || Number(req.query.maxView) <= 100  ? Number(req.query.maxView) : 100;
    const seed     = !!req.query.seed     ? Number(req.query.seed)    : undefined;
    const workbook = req.query.workbooks;
    const level    = !!req.query.levels ? req.query.levels : undefined;
    const keyword = req.query.keyword;
    const keywordOption = Number(req.query.keywordOption) || undefined;
    const crctAnsRatio = !!req.query.crctAnsRatio ? req.query.crctAnsRatio.map(v => Number(v)) : undefined;
    const userId = req.userId;
  
    const quizzes = await QuizzesService.findMany(userId, {
      page,
      maxView,
      seed,
      workbook,
      level,
      keyword,
      keywordOption,
      crctAnsRatio
    });
  
    res.status(200).send(quizzes);
  }),

  post: typedAsyncWrapper<"/quizzes", "post">(async (req, res, next) => {
    const question: string | undefined = req.body.question;
    const answer: string | undefined = req.body.answer;
    const isPrivate = !(req.body.isPublic);
    const category = req.body.category;
    const subCategory = category !== 0 ? Number(req.body.subCategory) : 0;
    const wid = req.body.wid;
    const limitedUser = req.body.limitedUser;
    const userId = req.userId;
  
    if (!question || !answer) {
      next(createError.invalidParams());
      return;
    }

    const quizId = await db.transaction().execute(async (trx) => {
      const workbookId = !!wid ? (await trx
      .selectFrom('workbooks')
      .select('id')
      .where('wid', '=', wid)
      .executeTakeFirst())?.id : null;
  
      const created = await trx.insertInto('quizzes')
      .values({
        que: question,
        ans: answer,
        creator_id: userId,
        workbook_id: workbookId,
      })
      .returningAll()
      .executeTakeFirst();

      if (!created) return;
  
      if (!!category && !!subCategory) {
        await trx.insertInto('quizzes_categories')
        .values({
          quiz_id: created.id,
          category_id: category,
          sub_category_id: subCategory,
          user_id: userId,
        })
        .executeTakeFirst();
      }
  
      if (isPrivate) {
        const visibleUser = !!limitedUser 
        ? await limitedUserIds(trx, limitedUser) 
        : [ userId ];
  
        for (const user of visibleUser) {
          await trx.insertInto('quiz_visible_users')
          .values({
            quiz_id: created.id,
            user_id: user,
          })
          .execute();
        }
      }

      return created.id
    });

    if (!quizId) {
      next('no user');
      return;
    }

    const quiz = await QuizzesService.find(userId, quizId);
  
    res.status(201).send(quiz);
  }),

  put: typedAsyncWrapper<"/quizzes", "put">(async (req, res, next) => {
    const quizId = req.body.id;
    const question: string | undefined = req.body.question;
    const answer: string | undefined = req.body.answer;
    const isPrivate = !(req.body.isPublic);
    const category = req.body.category;
    const subCategory = category !== 0 ? req.body.subCategory : 0;
    const wid = req.body.wid;
    const limitedUser = req.body.limitedUser;
    const userId = req.userId;

    if (!question || !answer || !quizId) {
      next(createError.invalidParams());
      return;
    }

    await db.transaction().execute(async (trx) => {
      const limitedUserIdList = !!limitedUser ? await limitedUserIds(trx, limitedUser) : [];

      const workbookId = !!wid ? (await trx
      .selectFrom('workbooks')
      .select('id')
      .where('wid', '=', wid)
      .executeTakeFirst())?.id : null;

      await trx.updateTable('quizzes')
      .set({
        que: question,
        ans: answer,
        creator_id: userId,
        workbook_id: workbookId,
      })
      .where('id', '=', quizId)
      .executeTakeFirst();

      const oldCategory = await trx
      .selectFrom('quizzes_categories')
      .selectAll()
      .where(({ eb, and }) => and([
        eb('quiz_id', '=', quizId),
        eb('user_id', '=', userId)
      ]))
      .executeTakeFirst();

      if (category != null && subCategory != null) {
        const categoryData = {
          quiz_id: quizId,
          category_id: category,
          sub_category_id: subCategory,
          user_id: userId,
        }
        
        if (!!oldCategory) {
          await trx.updateTable('quizzes_categories')
          .set(categoryData)
          .where('quiz_id', '=', quizId)
          .execute();
        } else {
          await trx.insertInto('quizzes_categories')
          .values(categoryData)
          .executeTakeFirst();
        }
      }

      const oldVisibleUser = (await trx
      .selectFrom('quiz_visible_users')
      .select('user_id')
      .where('quiz_id', '=', quizId)
      .execute()).map(u => u.user_id);

      const published = oldVisibleUser.length == 0;

      if (isPrivate) {    // 公開範囲をPrivateに変更
        if (published) {  // もともとがPublishだった場合
          const visibleUser = [ ...limitedUserIdList, userId ];

          for (const user of visibleUser) {
            await trx
            .insertInto('quiz_visible_users')
            .values({
              quiz_id: quizId,
              user_id: user,
            })
            .execute();
          }
        } 
        else {
          const visibleUser = limitedUserIdList.filter(u => oldVisibleUser.includes(u));
          const unVisibleUser = oldVisibleUser.filter(u => limitedUserIdList.includes(u));

          for (const user of visibleUser) {
            await trx
            .insertInto('quiz_visible_users')
            .values({
              quiz_id: quizId,
              user_id: user,
            })
            .execute();
          }

          for (const user of unVisibleUser) {
            await trx.deleteFrom('quiz_visible_users')
            .where(({ eb, and }) => and([
              eb('quiz_id', '=', quizId),
              eb('user_id', '=', user),
            ]))
            .execute();
          }
        }
      }
      else { // publicに変更
        await trx.deleteFrom('quiz_visible_users')
        .where('quiz_id', '=', quizId)
        .execute();
      }
    });

    const quiz = await QuizzesService.find(userId, quizId);

    res.status(200).send(quiz);
  }),

  getFavorite: typedAsyncWrapper<"/quizzes/favorite", "get">(async (req, res) => {
    if (!req.query) return;
  
    const page     = !!req.query.page     ? Number(req.query.page)    : 1;
    const maxView  = !!req.query.maxView || Number(req.query.maxView) <= 100  ? Number(req.query.maxView) : 100;
    const seed     = !!req.query.seed     ? Number(req.query.seed)    : undefined;
    const workbook = req.query.workbooks;
    const level    = !!req.query.levels ? req.query.levels : undefined;
    const keyword = req.query.keyword;
    const keywordOption = Number(req.query.keywordOption) || undefined;
    const crctAnsRatio = !!req.query.crctAnsRatio ? req.query.crctAnsRatio.map(v => Number(v)) : undefined;
    const userId = req.userId;
  
    const quizzes = await QuizzesService.findMany(userId, {
      page,
      maxView,
      seed,
      workbook,
      level,
      keyword,
      keywordOption,
      crctAnsRatio,
    }, 'favorite');
  
    res.status(200).send(quizzes);
  }),

  postFavorite: typedAsyncWrapper<"/quizzes/favorite", "post">(async (req, res) => {
    const quizId = req.body.quizId;
    const userId = req.userId;

    await createFavorite({ userId, quizId });
    const quiz = await QuizzesService.find(userId, quizId);
  
    res.status(201).send(quiz);
  }),

  deleteFavorite: typedAsyncWrapper<"/quizzes/favorite", "delete">(async (req, res) => {
    const quizId = req.body.quizId;
    const userId = req.userId;

    await removeFavorite({ userId, quizId });
  
    res.status(204).send();
  }),

  getHistory: typedAsyncWrapper<"/quizzes/history", "get">(async (req, res) => {
    if (!req.query) return;
  
    const page     = !!req.query.page     ? Number(req.query.page)    : 1;
    const maxView  = !!req.query.maxView || Number(req.query.maxView) <= 100  ? Number(req.query.maxView) : 100;
    const seed     = !!req.query.seed     ? Number(req.query.seed)    : undefined;
    const workbook = req.query.workbooks;
    const level    = !!req.query.levels ? req.query.levels : undefined;
    const keyword = req.query.keyword;
    const keywordOption = Number(req.query.keywordOption) || undefined;
    const crctAnsRatio = !!req.query.crctAnsRatio ? req.query.crctAnsRatio.map(v => Number(v)) : undefined;
    const since = req.query.since;
    const until = req.query.until;
    const judgement = req.query.judement;
    const userId = req.userId;
  
    const quizzes = await QuizzesService.findMany(userId, {
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
      judgement
    }, 'history');
  
    res.status(200).send(quizzes);
  }),

  postHistory: typedAsyncWrapper<"/quizzes/history", "post">(async (req, res) => {
    const quizId = req.body.quizId;
    const judgement = req.body.judgement;
    const pressedWord = req.body.pressedWord;
    const userId = req.userId;

    await createHistory({
      quizId,
      userId,
      judgement,
      pressedWord,
    });
  
    const quiz = await QuizzesService.find(userId, quizId);
  
    res.status(201).send(quiz);
  }),

  getMylist: typedAsyncWrapper<"/quizzes/mylist/{mid}", "get">(async (req, res) => {
    if (!req.query) return;
  
    const page     = !!req.query.page     ? Number(req.query.page)    : 1;
    const maxView  = !!req.query.maxView || Number(req.query.maxView) <= 100  ? Number(req.query.maxView) : 100;
    const seed     = !!req.query.seed     ? Number(req.query.seed)    : undefined;
    const workbook = req.query.workbooks;
    const level    = !!req.query.levels ? req.query.levels : undefined;
    const keyword = req.query.keyword;
    const keywordOption = Number(req.query.keywordOption) || undefined;
    const crctAnsRatio = !!req.query.crctAnsRatio ? req.query.crctAnsRatio.map(v => Number(v)) : undefined;
    const mid = req.params.mid;
    const userId = req.userId;
  
    const quizzes = await QuizzesService.findMany(userId, {
      page,
      maxView,
      seed,
      workbook,
      level,
      keyword,
      keywordOption,
      crctAnsRatio,
      mid
    }, 'mylist');
  
    res.status(200).send(quizzes);
  }),

  postMylist: typedAsyncWrapper<"/quizzes/mylist/{mid}", "post">(async (req, res) => {
    const quizId = req.body.quizId;
    const mid = req.params.mid;
    const userId = req.userId;
    const now = format(dayjs().toDate());
  
    const mylistId = (await db.selectFrom('mylists').select('id').where('mid', '=', mid).executeTakeFirstOrThrow()).id;
  
    await db.insertInto('mylists_quizzes')
    .values({
      mylist_id: mylistId,
      quiz_id: quizId,
      registered: now,
    })
    .execute();
  
    const quiz = await QuizzesService.find(userId, quizId);
  
    res.status(201).send(quiz);
  }),

  deleteMylist: typedAsyncWrapper<"/quizzes/mylist/{mid}", "delete">(async (req, res) => {
    const quizId = req.body.quizId;
    const mid = req.params.mid;
  
    const mylistId = (await db.selectFrom('mylists').select('id').where('mid', '=', mid).executeTakeFirstOrThrow()).id;
  
    await db.deleteFrom('mylists_quizzes')
    .where(({ eb, and }) => and([
      eb('mylist_id', '=', mylistId),
      eb('quiz_id', '=', quizId)
    ]))
    .execute();
  
    res.status(204).send();
  }),

  postWorkbook: typedAsyncWrapper<"/quizzes/workbook/{wid}", "post">(async (req, res) => {
    const quizId = req.body.quizId;
    const wid = req.params.wid;
    const userId = req.userId;
  
    const workbookId = (await db.selectFrom('workbooks').select('id').where('wid', '=', wid).executeTakeFirstOrThrow()).id;
  
    await db.updateTable('quizzes')
    .set({
      workbook_id: workbookId,
    })
    .where('id', '=', quizId)
    .execute();
  
    const quiz = await QuizzesService.find(userId, quizId);
  
    res.status(201).send(quiz);
  }),

  deleteWorkbook: typedAsyncWrapper<"/quizzes/workbook/{wid}", "delete">(async (req, res) => {
    const quizId = req.body.quizId;
    const wid = req.params.wid;
  
    await db.updateTable('quizzes')
    .set({
      workbook_id: null
    })
    .where('id', '=', quizId)
    .execute();
  
    res.status(204).send();
  }),

  getCreate: typedAsyncWrapper<"/quizzes", "get">(async (req, res) => {
    if (!req.query) return;
  
    const page     = !!req.query.page     ? Number(req.query.page)    : 1;
    const maxView  = !!req.query.maxView || Number(req.query.maxView) <= 100  ? Number(req.query.maxView) : 100;
    const seed     = !!req.query.seed     ? Number(req.query.seed)    : undefined;
    const workbook = req.query.workbooks;
    const level    = !!req.query.levels ? req.query.levels : undefined;
    const keyword = req.query.keyword;
    const keywordOption = Number(req.query.keywordOption) || undefined;
    const crctAnsRatio = !!req.query.crctAnsRatio ? req.query.crctAnsRatio.map(v => Number(v)) : undefined;
    const userId = req.userId;
  
    const quizzes = await QuizzesService.findMany(userId, {
      page,
      maxView,
      seed,
      workbook,
      level,
      keyword,
      keywordOption,
      crctAnsRatio
    }, 'create');
  
    res.status(200).send(quizzes);
  }),

}