import { ApiError } from 'api';

import IQuizQueryService from '@/applications/queryservices/IQuizQueryService';
import QuizUseCase from '@/applications/usecases/QuizUseCase';
import dayjs from '@/plugins/day';
import { typedAsyncWrapper } from '@/utils';

type QuizzesPath = '' | '/favorite' | '/history' | '/mylist/{mid}';

export default class QuizController {
  constructor(
    private quizQueryService: IQuizQueryService,
    private quizUseCase: QuizUseCase,
  ) {}

  get(path: QuizzesPath = '') {
    return typedAsyncWrapper<'/quizzes', "get">(async (req, res) => {
      if (!req.query) return;

      const page     = !!req.query.page     ? Number(req.query.page)    : 1;
      const maxView  = !!req.query.maxView || Number(req.query.maxView) <= 100  ? Number(req.query.maxView) : 100;
      const seed     = !!req.query.seed     ? Number(req.query.seed)    : undefined;
      const wids     = req.query.workbooks || [];
      const keyword = req.query.keyword || undefined;
      const keywordOption = (req.query.keywordOption) || undefined;
      const uid = req.uid;
      const since = ('since' in req.query) ? Number(req.query.since) || undefined : undefined;
      const until = ('until' in req.query) ? Number(req.query.until) || undefined : undefined;
      const judgements = ('judement' in req.query) ? req.query.judement || undefined : undefined;
      const mid = req.query && ('mid' in req.query) ? req.query.mid || undefined : undefined;
      
      const quizzes = await this.quizQueryService.findMany(uid, {
        page,
        maxView,
        seed,
        wids,
        keyword,
        keywordOption,
        since: !!since ? dayjs(since).toDate() : undefined,
        until: !!until ? dayjs(until).toDate() : undefined,
        judgements,
        mid,
      }, path);

      res.status(200).send(quizzes);
    });
  }

  post() {
    return typedAsyncWrapper<"/quizzes", "post">(async (req, res) => {
      const question: string | undefined = req.body.question;
      const answer:   string | undefined = req.body.answer;
      const anotherAnswer = req.body.anotherAnswer || undefined;
      const tags = req.body.tags || [];
      const category = req.body.category || undefined;
      const subCategory = category !== 0 && !!req.body.subCategory ? Number(req.body.subCategory) : undefined;
      const wid = req.body.wid || undefined;
      const limitedUser = req.body.limitedUser || [];
      const uid = req.uid;

      if (!question || !answer) {
        throw new ApiError().invalidParams();
      }

      await this.quizUseCase.addQuiz(
        question,
        answer,
        tags,
        limitedUser,
        uid,
        anotherAnswer,
        category,
        subCategory,
        wid,
      );

      res.status(201).send();
    });
  }

  multiplePost() {
    return typedAsyncWrapper<"/quizzes/multiple", "post">(async (req, res) => {
      const records = req.body.records;
      const uid = req.uid;

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
      const subCategory = category !== 0 ? req.body.subCategory || undefined : 0;
      const wid = req.body.wid || undefined;
      const limitedUser = req.body.limitedUser || [];
      const uid = req.uid;

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
        subCategory,
        wid,
      );

      res.status(201).send();
    });
  }
}
