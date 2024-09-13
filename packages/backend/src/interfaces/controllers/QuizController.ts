import { ApiError } from 'api';

import IQuizQueryService from '@/applications/queryservices/IQuizQueryService';
import FavoriteService from '@/domains/Favorite/FavoriteService';
import HistoryService from '@/domains/History/HistoryServise';
import Quiz from '@/domains/Quiz';
import IQuizRepository from '@/domains/Quiz/IQuizRepository';
import QuizService from '@/domains/Quiz/QuizService';
import RegisteredQuizService from '@/domains/RegisteredQuiz/ResisteredQuizService';
import dayjs from '@/plugins/day';
import { typedAsyncWrapper } from '@/utils';
import TaggedQuizService from '@/domains/TaggedQuiz/TaggedQuizService';

type QuizzesPath = '' | '/favorite' | '/history' | '/mylist/{mid}';

export default class QuizController {
  constructor(
    private quizService: QuizService,
    private quizRepository: IQuizRepository,
    private quizQueryService: IQuizQueryService,
    private favoriteService: FavoriteService,
    private historyService: HistoryService,
    private registeredQuizService: RegisteredQuizService,
    private taggedQuizService: TaggedQuizService,
  ) {}

  get(path: QuizzesPath = '') {
    return typedAsyncWrapper<`/quizzes${QuizzesPath}`, "get">(async (req, res) => {
      if (!req.query) return;

      const page     = !!req.query.page     ? Number(req.query.page)    : 1;
      const maxView  = !!req.query.maxView || Number(req.query.maxView) <= 100  ? Number(req.query.maxView) : 100;
      const seed     = !!req.query.seed     ? Number(req.query.seed)    : undefined;
      const wids     = req.query.workbooks || [];
      const levelIds = req.query.levels || [];
      const keyword = req.query.keyword || undefined;
      const keywordOption = (req.query.keywordOption) || undefined;
      const uid = req.uid;
      const since = ('since' in req.query) ? Number(req.query.since) || undefined : undefined;
      const until = ('until' in req.query) ? Number(req.query.until) || undefined : undefined;
      const judgements = ('judement' in req.query) ? req.query.judement || undefined : undefined;
      const mid = req.params && ('mid' in req.params) ? req.params.mid || undefined : undefined;
      
      const quizzes = await this.quizQueryService.findMany(uid, {
        page,
        maxView,
        seed,
        wids,
        levelIds,
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
      const anotherAnswer = req.body.anotherAnswer;
      const category = req.body.category || null;
      const subCategory = category !== 0 && !!req.body.subCategory ? Number(req.body.subCategory) : null;
      const wid = req.body.wid || null;
      const limitedUser = req.body.limitedUser || [];
      const uid = req.uid;

      if (!question || !answer) {
        throw new ApiError().invalidParams();
      }

      const qid = this.quizService.generateQid();

      const quiz = new Quiz(
        qid,
        question,
        answer,
        anotherAnswer || null,
        wid,
        category,
        subCategory,
        uid,
        limitedUser,
      );

      await this.quizRepository.save(quiz);

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

      const quizzes = records.map(record => {
        const qid = this.quizService.generateQid();

        return new Quiz(
          qid,
          record.question,
          record.answer,
          record.anotherAnswer || null,
          record.wid || null,
          record.category || null,
          record.subCategory || null,
          uid,
          record.limitedUser || [],
        );
      });

      await this.quizRepository.saveMany(quizzes);

      res.status(201).send();
    });
  }

  put() {
    return typedAsyncWrapper<"/quizzes", "put">(async (req, res) => {
      const qid = req.body.qid;
      const question: string | undefined = req.body.question;
      const answer: string | undefined = req.body.answer;
      const anotherAnswer = req.body.anotherAnswer;
      const category = req.body.category || null;
      const subCategory = category !== 0 ? req.body.subCategory || null : 0;
      const wid = req.body.wid || null;
      const limitedUser = req.body.limitedUser || [];
      const uid = req.uid;

      if (!question || !answer || !qid) {
        throw new ApiError().invalidParams();
      }

      const quiz = await this.quizRepository.findByQid(qid);
      if (!quiz) {
        throw new ApiError().invalidParams();
      }

      await this.quizRepository.update(new Quiz(
        quiz.qid,
        question,
        answer,
        anotherAnswer || null,
        wid,
        category,
        subCategory,
        uid,
        limitedUser,
      ));

      res.status(201).send();
    });
  }

  favorite() {
    return typedAsyncWrapper<"/quizzes/favorite", "post">(async (req, res) => {
      const qid = req.body.qid;
      const uid = req.uid;

      if (!qid) {
        throw new ApiError().invalidParams();
      }

      this.favoriteService.add(uid, qid);

      res.status(201).send();
    });
  }

  unfavorite() {
    return typedAsyncWrapper<"/quizzes/favorite", "delete">(async (req, res) => {
      const qid = req.body.qid;
      const uid = req.uid;

      if (!qid) {
        throw new ApiError().invalidParams();
      }

      this.favoriteService.delete(uid, qid);

      res.status(204).send();
    });
  }

  practice() {
    return typedAsyncWrapper<"/quizzes/history", "post">(async (req, res) => {
      const qid = req.body.qid;
      const judgement = req.body.judgement;
      const pressedWord = req.body.pressedWord;
      const uid = req.uid;

      if (!qid || !judgement) {
        throw new ApiError().invalidParams();
      }

      this.historyService.add(uid, qid, judgement, pressedWord || null);

      res.status(201).send();
    });
  }

  register() {
    return typedAsyncWrapper<"/quizzes/mylist/{mid}", "post">(async (req, res) => {
      const qid = req.body.qid;
      const mid = req.params.mid;

      this.registeredQuizService.add(mid, qid);

      res.status(201).send();
    });
  }

  unregister() {
    return typedAsyncWrapper<"/quizzes/mylist/{mid}", "delete">(async (req, res) => {
      const qid = req.body.qid;
      const mid = req.params.mid;

      this.registeredQuizService.delete(mid, qid);

      res.status(201).send();
    });
  }

  tagging() {
    return typedAsyncWrapper<"/quizzes/tag/{tid}", "post">(async (req, res) => {
      const qid = req.body.qid;
      const tid = req.params.tid;

      this.taggedQuizService.add(tid, qid);

      res.status(201).send();
    });
  }

  untagging() {
    return typedAsyncWrapper<"/quizzes/tag/{tid}", "delete">(async (req, res) => {
      const qid = req.body.qid;
      const tid = req.params.tid;

      this.taggedQuizService.delete(tid, qid);

      res.status(201).send();
    });
  }

  addWorkbook() {
    return typedAsyncWrapper<"/quizzes/workbook/{wid}", "post">(async (req, res) => {
      const qid = req.body.qid;
      const wid = req.params.wid;

      if (!qid || !wid) {
        throw new ApiError().invalidParams();
      }

      const quiz = await this.quizRepository.findByQid(qid);
      if (!quiz) {
        throw new ApiError().invalidParams();
      }

      await this.quizRepository.update(new Quiz(
        quiz.qid,
        quiz.question,
        quiz.answer,
        quiz.anotherAnswer,
        wid,
        quiz.categoryId,
        quiz.subCategoryId,
        quiz.creatorUid,
        quiz.visibleUids,
      ));

      res.status(201).send()
    });
  }

  deleteWorkbook() {
    return typedAsyncWrapper<"/quizzes/workbook/{wid}", "delete">(async (req, res) => {
      const qid = req.body.qid;

      if (!qid) {
        throw new ApiError().invalidParams();
      }

      const quiz = await this.quizRepository.findByQid(qid);
      if (!quiz) {
        throw new ApiError().invalidParams();
      }

      await this.quizRepository.update(new Quiz(
        quiz.qid,
        quiz.question,
        quiz.answer,
        quiz.anotherAnswer,
        null,
        quiz.categoryId,
        quiz.subCategoryId,
        quiz.creatorUid,
        quiz.visibleUids,
      ));
    });
  }
}
