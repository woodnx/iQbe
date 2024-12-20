import { ApiError } from 'api';
import { isArray } from 'lodash';

import IQuizQueryService from '@/applications/queryservices/IQuizQueryService';
import QuizUseCase from '@/applications/usecases/QuizUseCase';
import { typedAsyncWrapper } from '@/utils';

export default class QuizController {
  constructor(
    private quizQueryService: IQuizQueryService,
    private quizUseCase: QuizUseCase,
  ) {}

  get() {
    return typedAsyncWrapper<'/quizzes', "get">(async (req, res) => {
      if (!req.query) return;

      const page     = !!req.query.page     ? Number(req.query.page)    : 1;
      const maxView  = !!req.query.maxView || Number(req.query.maxView) <= 100  ? Number(req.query.maxView) : 100;
      const seed     = !!req.query.seed     ? Number(req.query.seed)    : undefined;
      const wids     = req.query.wids || [];
      const keyword = req.query.keyword || undefined;
      const keywordOption = (req.query.keywordOption) || undefined;
      const uid = req.user.uid;
      const since = ('since' in req.query) ? Number(req.query.since) || undefined : undefined;
      const until = ('until' in req.query) ? Number(req.query.until) || undefined : undefined;
      const mid = req.query && ('mid' in req.query) ? req.query.mid || undefined : undefined;
      const isFavorite = !!req.query.isFavorite;
      const judgements = req.query.judgements
        ? isArray(req.query.judgements) 
        ? req.query.judgements 
        : [ req.query.judgements ]
        : undefined;
      const categories = req.query.categories || undefined;
      const tags = req.query.tags || undefined;
      const tagMatchAll = req.query.tagMatchAll;
      
      const quizzes = await this.quizQueryService.findMany(uid, {
        page,
        maxView,
        seed,
        wids,
        keyword,
        keywordOption,
        since,
        until,
        judgements,
        mid,
        isFavorite,
        categories,
        tags,
        tagMatchAll,
      });

      res.status(200).send(quizzes);
    });
  }

  size() {
    return typedAsyncWrapper<'/quizzes/size', "get">(async (req, res) => {
      if (!req.query) return;

      const wids = req.query.wids || [];
      const keyword = req.query.keyword || undefined;
      const keywordOption = (req.query.keywordOption) || undefined;
      const uid = req.user.uid;
      const since = ('since' in req.query) ? Number(req.query.since) || undefined : undefined;
      const until = ('until' in req.query) ? Number(req.query.until) || undefined : undefined;
      const mid = req.query && ('mid' in req.query) ? req.query.mid || undefined : undefined;
      const isFavorite = !!req.query.isFavorite;
      const judgements = req.query.judgements
        ? isArray(req.query.judgements) 
        ? req.query.judgements 
        : [ req.query.judgements ]
        : undefined;

      const size = await this.quizQueryService.count(uid, {
        wids,
        keyword,
        keywordOption,
        since,
        until,
        judgements,
        mid,
        isFavorite,
      });

      res.status(200).send({ size });
    });
  }

  post() {
    return typedAsyncWrapper<"/quizzes", "post">(async (req, res) => {
      const question: string | undefined = req.body.question;
      const answer:   string | undefined = req.body.answer;
      const anotherAnswer = req.body.anotherAnswer || undefined;
      const tags = req.body.tags || [];
      const category = req.body.category || undefined;
      const wid = req.body.wid || undefined;
      const limitedUser = req.body.limitedUser || [];
      const isPublic = !!req.body.isPublic;
      const uid = req.user.uid;

      if (!question || !answer) {
        throw new ApiError().invalidParams();
      }

      if (isPublic && !req.user.isSuperUser) {
        throw new ApiError().accessDenied();
      }

      await this.quizUseCase.addQuiz(
        question,
        answer,
        tags,
        isPublic,
        uid,
        anotherAnswer,
        category,
        wid,
      );

      res.status(201).send();
    });
  }

  multiplePost() {
    return typedAsyncWrapper<"/quizzes/multiple", "post">(async (req, res) => {
      const records = req.body.records;
      const uid = req.user.uid;

      if (!records) {
        throw new ApiError().invalidParams();
      }

      await this.quizUseCase.addQuizzes(
        records.map(r => ({
          question: r.question,
          answer: r.answer,
          anotherAnswer: r.anotherAnswer || undefined,
          tagLabels: r.tags || [],
          wid: r.wid || undefined,
          categoryId: r.category || undefined,
          subCategoryId: r.subCategory || undefined,
          limitedUser: r.limitedUser || [],
          uid,
        }))
      )

      res.status(201).send();
    });
  }

  put() {
    return typedAsyncWrapper<"/quizzes/{qid}", "put">(async (req, res) => {
      const qid = req.params.qid;
      const question: string | undefined = req.body.question;
      const answer: string | undefined = req.body.answer;
      const anotherAnswer = req.body.anotherAnswer || undefined;
      const category = req.body.category || undefined;
      const tags = req.body.tags || [];
      const wid = req.body.wid || undefined;
      const limitedUser = req.body.limitedUser || [];
      const uid = req.user.uid;

      if (!question || !answer || !qid) {
        throw new ApiError().invalidParams();
      }

      await this.quizUseCase.editQuiz(
        qid,
        question,
        answer,
        uid,
        tags,
        anotherAnswer,
        category,
        wid,
      );

      res.status(201).send();
    });
  }

  delete() {
    return typedAsyncWrapper<"/quizzes/{qid}", "delete">(async (req, res) => {
      const qid = req.params.qid;

      if (!qid) 
        throw new ApiError().internalProblems();

      await this.quizUseCase.deleteQuiz(qid);

      res.status(204).send();
    });
  }
}
