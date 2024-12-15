import { components } from 'api/schema';
import dayjs from 'dayjs';
import { sql } from 'kysely';
import { isEqual, sortBy, uniq } from 'lodash';

import IQuizQueryService, {
  countOption, findOption
} from '@/applications/queryservices/IQuizQueryService';
import Quiz from '@/domains/Quiz';
import IQuizRepository from '@/domains/Quiz/IQuizRepository';

import KyselyClientManager from './kysely/KyselyClientManager';
import CategoryInfra from './CategoryInfra';

type QuizDTO = components["schemas"]["Quiz"];

export default class QuizInfra implements IQuizRepository, IQuizQueryService {
  constructor(
    private clientManager: KyselyClientManager,
    private categoryInfra: CategoryInfra,
  ) {}

  private async addTagToQuiz(qid: string, tagLabel: string) {
    const client = this.clientManager.getClient();

    const tagId = await client.selectFrom('tags')
    .select(['id'])
    .where('label', '=', tagLabel)
    .executeTakeFirstOrThrow()
    .then(tag => tag.id);

    const quizId = await client.selectFrom('quizzes')
    .select(['id'])
    .where('qid', '=', qid)
    .executeTakeFirstOrThrow()
    .then(quiz => quiz.id)

    await client.insertInto('tagging')
    .values({
      tag_id: tagId,
      quiz_id: quizId,
      registered: new Date(),
    })
    .execute();
  }

  private async removeTagFromQuiz(qid: string, tagLabel: string) {
    const client = this.clientManager.getClient();

    const tagId = await client.selectFrom('tags')
    .select(['id'])
    .where('label', '=', tagLabel)
    .executeTakeFirstOrThrow()
    .then(tag => tag.id);

    const quizId = await client.selectFrom('quizzes')
    .select(['id'])
    .where('qid', '=', qid)
    .executeTakeFirstOrThrow()
    .then(quiz => quiz.id)

    await client.deleteFrom('tagging')
    .where(({ and, eb }) => and([
      eb('tag_id', '=', tagId),
      eb('quiz_id', '=', quizId),
    ]))
    .execute();
  }

  async findMany(uid: string, option: findOption = {}): Promise<QuizDTO[]> {
    const client = this.clientManager.getClient();

    const userId = await client.selectFrom('users')
    .select('id')
    .where('uid', '=', uid)
    .executeTakeFirstOrThrow()
    .then(u => u.id);

    let query = client.selectFrom('quizzes')
    .leftJoin('workbooks', 'quizzes.workbook_id', 'workbooks.id')
    .leftJoin('levels', 'workbooks.level_id', 'levels.id')
    .innerJoin('users', 'users.id', 'quizzes.creator_id')
    .leftJoin('quiz_visible_users', 'quiz_visible_users.quiz_id', 'quizzes.id')
    .select(({ fn }) => [
      'quizzes.id as id',
      'quizzes.qid as qid',
      'quizzes.que as question',
      'quizzes.ans as answer',
      'quizzes.anoans as anotherAnswer',
      'workbooks.wid as wid', 
      'users.uid as creatorId',
      'quizzes.category_id as categoryId',
      'quizzes.total_crct_ans as right',
      sql<number>`total_crct_ans + total_through_ans + total_wrng_ans`.as('total'),
      fn.countAll<number>().over().as('size'),
    ])
    .where(({ eb, or }) => or([
      eb('quiz_visible_users.user_id', 'is', null),
      eb('quiz_visible_users.user_id', '=', userId),
    ]));

    if (!!option.wids && option.wids.length)
      if (Array.isArray(option.wids)) 
        query = query.where('workbooks.wid', 'in', option.wids);
      else
        query = query.where('workbooks.wid', '=', option.wids);
    if (!!option.seed)     query = query.orderBy(sql`RAND(${option.seed})`);
    if (!!option.keyword && !!option.keywordOption) {
      if (option.keywordOption === 1) {
        query = query.where((eb) => eb.or([
          eb('quizzes.que', 'like', `%${option.keyword}%`),
          eb('quizzes.ans', 'like', `%${option.keyword}%`)
        ]));
      }
      else if (option.keywordOption === 2) { 
        query = query.where('quizzes.que', 'like', `%${option.keyword}%`);
      }
      else { 
        query = query.where('quizzes.ans', 'like', `%${option.keyword}%`)
      }
    }
    if (!!option.categories) {
      if (Array.isArray(option.categories) && option.categories.length) 
        query = query.where('quizzes.category_id', 'in', option.categories);
      else
        query = query.where('quizzes.category_id', '=', option.categories);
      
    }
    if (!!option.tags) {
      if (Array.isArray(option.tags) && option.tags.length) {
        if (option.tagMatchAll) {
          query = query
          .innerJoin('tagging', 'tagging.quiz_id', 'quizzes.id')
          .innerJoin('tags', 'tagging.tag_id', 'tags.id')
          .where('tags.label', 'in', option.tags)
          .groupBy('quizzes.id')
          .having(({ fn }) => fn.count('tags.label'), '=', option.tags.length)
        } 
        else {
          query = query
          .innerJoin('tagging', 'tagging.quiz_id', 'quizzes.id')
          .innerJoin('tags', 'tagging.tag_id', 'tags.id')
          .where('tags.label', 'in', option.tags)
        }
      }
      else {
        query = query
        .innerJoin('tagging', 'tagging.quiz_id', 'quizzes.id')
        .innerJoin('tags', 'tagging.tag_id', 'tags.id')
        .where('tags.label', '=', option.tags)
      }  
    }
    // if (!!crctAnsRatio) {
    //   query = query.where(sql`quiz.total_crct_ans / (quiz.total_crct_ans + quiz.total_wrng_ans + quiz.total_through_ans) * 100 BETWEEN ${crctAnsRatio[0]} AND ${crctAnsRatio[1]}`)
    // }

    if (option.isFavorite) {
      query = query
      .innerJoin('favorites', 'favorites.quiz_id', 'quizzes.id')
      .where('favorites.user_id', '=', userId)
      .orderBy('favorites.registered desc'); 
    }
    else if (!!option.since && !!option.until) {
      const since = dayjs(option.since).toDate();
      const until = dayjs(option.until).toDate();

      query = query
      .innerJoin('histories', 'histories.quiz_id', 'quizzes.id')
      .select([
        'histories.judgement as judgement',
        'histories.practiced as practiced',
      ])
      .where('histories.user_id', '=', userId)
      .where(({ eb, and, between }) => (
        !!option.judgements
        ? and([
          eb('histories.judgement', 'in', option.judgements),
          between('histories.practiced', since, until)
        ])
        : between('histories.practiced', since, until)
      ))
      .orderBy('histories.practiced desc');
    }
    else if (!!option.mid) {
      query = query
      .innerJoin('mylists_quizzes', 'mylists_quizzes.quiz_id', 'quizzes.id')
      .innerJoin('mylists', 'mylists.id', 'mylists_quizzes.mylist_id')
      .where('mylists.mid', '=', option.mid)
      .where('mylists.user_id', '=', userId)
      .orderBy('mylists_quizzes.registered desc');
    }
    
    const maxView = option.maxView || 100;
    const page = option.page || 1;

    // execute
    const quizzes = await query
    .limit(maxView)
    .offset(maxView * (page - 1))
    .distinct()
    .execute();

    return Promise.all(
      quizzes.map(async q => {
        const { id: quizId, ...quiz } = q;
        
        const [ 
          category,
          workbook,
          isFavorite, 
          registerdMylist, 
          tags, 
          visibleUser 
        ] = await Promise.all([
          quiz.categoryId ? this.categoryInfra.findChainById(quiz.categoryId) : [],

          client.selectFrom('workbooks')
          .innerJoin('users', 'workbooks.creator_id', 'users.id')
          .select([
            'wid',
            'date',
            'name',
            'users.uid as creatorId',
          ])
          .where('wid', '=', quiz.wid)
          .executeTakeFirst(),

          client.selectFrom('favorites')
          .select('quiz_id')
          .where(({eb, and}) => and([
            eb('user_id', '=', userId),
            eb('quiz_id', '=', quizId)
          ]))
          .executeTakeFirst(),
  
          client.selectFrom('mylists_quizzes')
          .innerJoin('mylists', 'mylists_quizzes.mylist_id', 'mylists.id')
          .select([
            'mylists.mid as mid',
            'mylists.name as name',
            'mylists.created as created'
          ])
          .where(({eb, and}) => and([
            eb('mylists.user_id', '=', userId),
            eb('mylists_quizzes.quiz_id', '=', quizId)
          ]))
          .execute(),

          client.selectFrom('tagging')
          .innerJoin('tags', 'tagging.tag_id', 'tags.id')
          .select([
            'tags.label as label',
            'tags.created as created',
            'tags.modified as modified'
          ])
          .where('tagging.quiz_id', '=', quizId)
          .execute(),
  
          client.selectFrom('quiz_visible_users')
          .innerJoin('users', 'users.id', 'quiz_visible_users.user_id')
          .select([ 'uid' ])
          .where(({ eb, and }) => and([
            eb('quiz_id', '=', quizId),
          ]))
          .executeTakeFirst()
        ]);
        
        return {
          qid: quiz.qid,
          question: quiz.question,
          answer: quiz.answer,
          anotherAnswer: quiz.anotherAnswer,
          creatorId: quiz.creatorId,
          isPublic: !visibleUser,
          isFavorite: !!isFavorite,
          right: quiz.right || 0,
          total: quiz.total || 0,
          registerdMylist,
          tags,
          workbook,
          category: category?.map(c => ({
            id: c.id,
            name: c.name,
            parentId: c.parentId,
            description: c.description,
            disabled: c.disabled,
          })),
        };
    }));
  }

  async count(uid: string, option: countOption = {}): Promise<number> {
    const client = this.clientManager.getClient();

    const userId = await client.selectFrom('users')
    .select('id')
    .where('uid', '=', uid)
    .executeTakeFirstOrThrow()
    .then(u => u.id);

    let query = client.selectFrom('quizzes')
    .leftJoin('workbooks', 'quizzes.workbook_id', 'workbooks.id')
    .leftJoin('levels', 'workbooks.level_id', 'levels.id')
    .innerJoin('users', 'users.id', 'quizzes.creator_id')
    .leftJoin('quiz_visible_users', 'quiz_visible_users.quiz_id', 'quizzes.id')
    .select(({ fn }) => [
      fn.countAll<number>().over().as('size'),
    ])
    .where(({ eb, or }) => or([
      eb('quiz_visible_users.user_id', 'is', null),
      eb('quiz_visible_users.user_id', '=', userId),
    ]));

    if (!!option.wids && option.wids.length)
      if (Array.isArray(option.wids)) 
        query = query.where('workbooks.wid', 'in', option.wids);
      else
        query = query.where('workbooks.wid', '=', option.wids);
    if (!!option.keyword && !!option.keywordOption) {
      if (option.keywordOption === 1) {
        query = query.where((eb) => eb.or([
          eb('quizzes.que', 'like', `%${option.keyword}%`),
          eb('quizzes.ans', 'like', `%${option.keyword}%`)
        ]));
      }
      else if (option.keywordOption === 2) { 
        query = query.where('quizzes.que', 'like', `%${option.keyword}%`);
      }
      else { 
        query = query.where('quizzes.ans', 'like', `%${option.keyword}%`)
      }
    }
    if (!!option.categories) {
      if (Array.isArray(option.categories) && option.categories.length) 
        query = query.where('quizzes.category_id', 'in', option.categories);
      else
        query = query.where('quizzes.category_id', '=', option.categories);
      
    }
    if (!!option.tags) {
      if (Array.isArray(option.tags) && option.tags.length) {
        query = query
        .innerJoin('tagging', 'tagging.quiz_id', 'quizzes.id')
        .innerJoin('tags', 'tagging.tag_id', 'tags.id')
        .where('tags.label', 'in', option.tags)
      }
      else {
        query = query
        .innerJoin('tagging', 'tagging.quiz_id', 'quizzes.id')
        .innerJoin('tags', 'tagging.tag_id', 'tags.id')
        .where('tags.label', '=', option.tags)
      }  
    }
    // if (!!crctAnsRatio) {
    //   query = query.where(sql`quiz.total_crct_ans / (quiz.total_crct_ans + quiz.total_wrng_ans + quiz.total_through_ans) * 100 BETWEEN ${crctAnsRatio[0]} AND ${crctAnsRatio[1]}`)
    // }

    if (option.isFavorite) {
      query = query
      .innerJoin('favorites', 'favorites.quiz_id', 'quizzes.id')
      .where('favorites.user_id', '=', userId);
    }
    else if (!!option.since && !!option.until) {
      const since = dayjs(option.since).toDate() ;
      const until = dayjs(option.until).toDate();

      query = query
      .innerJoin('histories', 'histories.quiz_id', 'quizzes.id')
      .select([
        'histories.judgement as judgement',
        'histories.practiced as practiced',
      ])
      .where('histories.user_id', '=', userId)
      .where(({ eb, and, between }) => (
        !!option.judgements
        ? and([
          eb('histories.judgement', 'in', option.judgements),
          between('histories.practiced', since, until)
        ])
        : between('histories.practiced', since, until)
      ))
      .orderBy('histories.practiced desc');
    }
    else if (!!option.mid) {
      query = query
      .innerJoin('mylists_quizzes', 'mylists_quizzes.quiz_id', 'quizzes.id')
      .innerJoin('mylists', 'mylists.id', 'mylists_quizzes.mylist_id')
      .where('mylists.mid', '=', option.mid)
      .where('mylists.user_id', '=', userId)
      .orderBy('mylists_quizzes.registered desc');
    }

    const quizzes = await query.execute();

    return !!quizzes.length ? quizzes[0].size : 0;
  }

  async findByQid(qid: string): Promise<Quiz | null> {
    const client = this.clientManager.getClient();

    const quiz = await client.selectFrom('quizzes')
    .leftJoin('workbooks', 'quizzes.workbook_id', 'workbooks.id')
    .leftJoin('levels', 'workbooks.level_id', 'levels.id')
    .innerJoin('users', 'users.id', 'quizzes.creator_id')
    .select([
      'quizzes.id as quizId',
      'quizzes.qid as qid',
      'quizzes.que as question',
      'quizzes.ans as answer',
      'quizzes.anoans as anotherAnswer',
      'workbooks.wid as wid', 
      'users.uid as creatorUid',
      'quizzes.category_id as categoryId',
      'quizzes.sub_category_id as subCategoryId',
      'quizzes.total_crct_ans as right',
      sql<number>`total_crct_ans + total_through_ans + total_wrng_ans`.as('total'),
    ])
    .where('quizzes.qid', '=', qid)
    .executeTakeFirstOrThrow();

    const [ visibleUser, tags ] = await Promise.all([
      client.selectFrom('quiz_visible_users')
      .innerJoin('users', 'users.id', 'quiz_visible_users.user_id')
      .select([ 'uid' ])
      .where(({ eb, and }) => and([
        eb('quiz_visible_users.quiz_id', '=', quiz.quizId),
      ]))
      .execute()
      .then(users => users?.map(u => u.uid)),

      client.selectFrom('tagging')
      .innerJoin('tags', 'tagging.tag_id', 'tags.id')
      .select('tags.label as label')
      .where('tagging.quiz_id', '=', quiz.quizId)
      .execute()
      .then(tags => tags.map(t => t.label)),
    ]);

    return Quiz.reconstruct(
      quiz.qid,
      quiz.question,
      quiz.answer,
      tags,
      quiz.total,
      quiz.right || 0,
      quiz.creatorUid,
      visibleUser || [],
      quiz.anotherAnswer,
      quiz.wid,
      quiz.categoryId,
    );
  }

  async findByTagLabel(tagLabel: string): Promise<Quiz[]> {
    const client = this.clientManager.getClient();

    const quizIds = await client.selectFrom('tagging')
    .innerJoin('tags', 'tags.id', 'tagging.tag_id')
    .select('tagging.quiz_id')
    .where('tags.label', '=', tagLabel)
    .execute()
    .then(quidIds => quidIds.map(q => q.quiz_id));

    const quizzes = await Promise.all(quizIds.map(async (quizId) => {
      const quiz = await client.selectFrom('quizzes')
      .leftJoin('workbooks', 'quizzes.workbook_id', 'workbooks.id')
      .leftJoin('levels', 'workbooks.level_id', 'levels.id')
      .innerJoin('users', 'users.id', 'quizzes.creator_id')
      .select([
        'quizzes.id as quizId',
        'quizzes.qid as qid',
        'quizzes.que as question',
        'quizzes.ans as answer',
        'quizzes.anoans as anotherAnswer',
        'workbooks.wid as wid', 
        'users.uid as creatorUid',
        'quizzes.category_id as categoryId',
        'quizzes.sub_category_id as subCategoryId',
        'quizzes.total_crct_ans as right',
        sql<number>`total_crct_ans + total_through_ans + total_wrng_ans`.as('total'),
      ])
      .where('quizzes.id', '=', quizId)
      .executeTakeFirstOrThrow();

      const [ visibleUser, tags ] = await Promise.all([
        client.selectFrom('quiz_visible_users')
        .innerJoin('users', 'users.id', 'quiz_visible_users.user_id')
        .select([ 'uid' ])
        .where(({ eb, and }) => and([
          eb('quiz_visible_users.quiz_id', '=', quizId),
        ]))
        .execute()
        .then(users => users?.map(u => u.uid)),

        client.selectFrom('tagging')
        .innerJoin('tags', 'tagging.tag_id', 'tags.id')
        .select('tags.label as label')
        .where('tagging.quiz_id', '=', quiz.quizId)
        .execute()
        .then(tags => tags.map(t => t.label)),
      ]);

      return Quiz.reconstruct(
        quiz.qid,
        quiz.question,
        quiz.answer,
        tags,
        quiz.total,
        quiz.right || 0,
        quiz.creatorUid,
        visibleUser || [],
        quiz.anotherAnswer,
        quiz.wid,
        quiz.categoryId,
      );
    }));

    return quizzes;
  }

  async save(quiz: Quiz): Promise<void> {
    const client = this.clientManager.getClient();

    const [ workbookId, userId ] = await Promise.all([
      client.selectFrom('workbooks')
      .select('id')
      .where('wid', '=', quiz.wid)
      .executeTakeFirst()
      .then(w => w?.id),

      client.selectFrom('users')
      .select('id')
      .where('uid', '=', quiz.creatorUid)
      .executeTakeFirstOrThrow()
      .then(u => u.id),
    ]);

    await client.insertInto('quizzes')
    .values({
      qid: quiz.qid,
      que: quiz.question,
      ans: quiz.answer,
      anoans: quiz.anotherAnswer,
      workbook_id: workbookId || null,
      creator_id: userId,
      category_id: quiz.categoryId,
    })
    .execute();

    const quizId = await client.selectFrom('quizzes')
    .select('id')
    .where('qid', '=', quiz.qid)
    .executeTakeFirstOrThrow()
    .then(quiz => quiz.id);

    // タグをクイズに付与
    const tagIds = await Promise.all(
      quiz.tagLabels.map(async (label) => {
        return await client.selectFrom('tags')
        .select('id')
        .where('label', '=', label)
        .executeTakeFirstOrThrow()
        .then(tag => tag.id)
      })
    );

    await Promise.all(
      tagIds.map(async (id) => 
        client.insertInto('tagging')
        .values({
          tag_id: id,
          quiz_id: quizId,
          registered: new Date(),
        })
        .execute()
      )
    );
  
    // Visibleなユーザの処理
    if (!quiz.isPublic()) {
      const visibleUser = !!quiz.visibleUids.length
      ? await Promise.all(quiz.visibleUids.map(async (user) => {
        return (await client.selectFrom('users').select('id').where('uid', '=', user).executeTakeFirstOrThrow()).id
      }))
      : [ userId ];
  
      for (const user of visibleUser) {
        await client.insertInto('quiz_visible_users')
        .values({
          quiz_id: quizId,
          user_id: user,
        })
        .execute();
      }
    }
  }

  async update(quiz: Quiz, tagsToAdd: string[], tagsToRemove: string[]): Promise<void> {
    const client = this.clientManager.getClient();

    const [ workbookId, userId ] = await Promise.all([
      client.selectFrom('workbooks')
      .select('id')
      .where('wid', '=', quiz.wid)
      .executeTakeFirst()
      .then(w => w?.id),

      client.selectFrom('users')
      .select('id')
      .where('uid', '=', quiz.creatorUid)
      .executeTakeFirstOrThrow()
      .then(u => u.id),
    ]);

    const visibleUserIds = !!quiz.visibleUids.length
    ? await Promise.all(quiz.visibleUids.map(async (user) => {
      return (
        client.selectFrom('users')
        .select('id')
        .where('uid', '=', user)
        .executeTakeFirstOrThrow()
        .then(user => user.id)
      )
    }))
    : [ userId ];

    const oldVisibleUserIds = await client.selectFrom('quiz_visible_users')
    .innerJoin('quizzes', 'quiz_visible_users.quiz_id', 'quizzes.id')
    .select('user_id')
    .where('quizzes.qid', '=', quiz.qid)
    .execute()
    .then(users => users.map(u => u.user_id));

    const isChangedVisibleUser = isEqual(
      uniq(sortBy(visibleUserIds)),
      uniq(sortBy(oldVisibleUserIds)),
    );

    await client.updateTable('quizzes')
    .set({
      que: quiz.question,
      ans: quiz.answer,
      anoans: quiz.anotherAnswer,
      workbook_id: workbookId,
      creator_id: userId,
      category_id: quiz.categoryId,
    })
    .where('qid', '=', quiz.qid)
    .executeTakeFirstOrThrow()
    
    const quizId = await client.selectFrom('quizzes')
    .select('id')
    .where('qid', '=', quiz.qid)
    .executeTakeFirstOrThrow()
    .then(quiz => quiz.id);

    for (const tag of tagsToAdd) {
      await this.addTagToQuiz(quiz.qid, tag);
    }
    for (const tag of tagsToRemove) {
      await this.removeTagFromQuiz(quiz.qid, tag);
    }

    if (isChangedVisibleUser) {
      if (quiz.isPublic()) { // limited / private -> publicに変更
        await client.deleteFrom('quiz_visible_users')
        .where('quiz_id', '=', quizId)
        .execute();
      }
      else { // public -> private / limited or private -> limited
        const visibleUser = visibleUserIds.filter(u => oldVisibleUserIds.includes(u));
        const unVisibleUser = oldVisibleUserIds.filter(u => visibleUserIds.includes(u));
  
        for (const user of visibleUser) {
          await client.insertInto('quiz_visible_users')
          .values({
            quiz_id: quizId,
            user_id: user,
          })
          .execute();
        }
  
        for (const user of unVisibleUser) {
          await client.deleteFrom('quiz_visible_users')
          .where(({ eb, and }) => and([
            eb('quiz_id', '=', quizId),
            eb('user_id', '=', user),
          ]))
          .execute();
        }
      }
    }
  }

  async delete(quiz: Quiz): Promise<void> {
    const client = this.clientManager.getClient();

    for (const tag of quiz.tagLabels) {
      await this.removeTagFromQuiz(quiz.qid, tag);
    }

    await client.deleteFrom('quizzes')
    .where('qid', '=', quiz.qid)
    .execute();
  }
}
