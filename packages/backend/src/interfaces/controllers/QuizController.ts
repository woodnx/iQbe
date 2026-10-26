import type { ApiContext } from "@/http/context.js";
import {
  getQuizzes,
  getQuizzesSize,
  postQuizzes,
  postQuizzesMultiple,
  putQuizzesQid,
  deleteQuizzesQid,
} from "@/http/schemas.js";
import { ApiError } from "@/http/ApiError.js";

import IQuizQueryService from "@/applications/queryservices/IQuizQueryService.js";
import { AddQuizUseCase } from "@/applications/usecases/Quiz/AddQuizUseCase.js";
import { DeleteQuizUseCase } from "@/applications/usecases/Quiz/DeleteQuizUseCase.js";
import { EditQuizUseCase } from "@/applications/usecases/Quiz/EditQuizUseCase.js";

export default class QuizController {
  constructor(
    private quizQueryService: IQuizQueryService,
    private addQuizUseCase: AddQuizUseCase,
    private editQuizUseCase: EditQuizUseCase,
    private deleteQuizUseCase: DeleteQuizUseCase,
  ) {}

  get() {
    return async (c: ApiContext<typeof getQuizzes>) => {
      const query = c.req.valid("query");

      const page = !!query.page ? Number(query.page) : 1;
      const maxView =
        !!query.maxView || Number(query.maxView) <= 100
          ? Number(query.maxView)
          : 100;
      const seed = !!query.seed ? Number(query.seed) : undefined;
      const wids = query.wids || [];
      const keyword = query.keyword || undefined;
      const keywordOption = query.keywordOption || undefined;
      const uid = c.get("user").uid;
      const since =
        "since" in query ? Number(query.since) || undefined : undefined;
      const until =
        "until" in query ? Number(query.until) || undefined : undefined;
      const mid = query && "mid" in query ? query.mid || undefined : undefined;
      const isFavorite = !!query.isFavorite;
      const judgements =
        query.judgements != null
          ? Array.isArray(query.judgements)
            ? query.judgements
            : [query.judgements]
          : undefined;
      const categories = query.categories || undefined;
      const tags = query.tags || undefined;
      const tagMatchAll = query.tagMatchAll;

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

      return c.json(quizzes, 200);
    };
  }

  size() {
    return async (c: ApiContext<typeof getQuizzesSize>) => {
      const query = c.req.valid("query");

      const wids = query.wids || [];
      const keyword = query.keyword || undefined;
      const keywordOption = query.keywordOption || undefined;
      const uid = c.get("user").uid;
      const since =
        "since" in query ? Number(query.since) || undefined : undefined;
      const until =
        "until" in query ? Number(query.until) || undefined : undefined;
      const mid = query && "mid" in query ? query.mid || undefined : undefined;
      const isFavorite = !!query.isFavorite;
      const judgements = query.judgements
        ? Array.isArray(query.judgements)
          ? query.judgements
          : [query.judgements]
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

      return c.json({ size }, 200);
    };
  }

  post() {
    return async (c: ApiContext<typeof postQuizzes>) => {
      const body = c.req.valid("json");
      const question: string | undefined = body.question;
      const answer: string | undefined = body.answer;
      const anotherAnswer = body.anotherAnswer || undefined;
      const tags = body.tags || [];
      const category = body.category || undefined;
      const wid = body.wid || undefined;
      const uid = c.get("user").uid;

      if (!question || !answer) {
        throw new ApiError().invalidParams();
      }

      await this.addQuizUseCase.execute({
        question,
        answer,
        tagLabels: tags,
        uid,
        anotherAnswer,
        categoryId: category,
        wid,
      });

      return c.body(null, 201);
    };
  }

  multiplePost() {
    return async (c: ApiContext<typeof postQuizzesMultiple>) => {
      const body = c.req.valid("json");
      const records = body.records;
      const uid = c.get("user").uid;

      if (!records) {
        throw new ApiError().invalidParams();
      }

      for (const r of records) {
        await this.addQuizUseCase.execute({
          question: r.question,
          answer: r.answer,
          anotherAnswer: r.anotherAnswer || undefined,
          tagLabels: r.tags || [],
          wid: r.wid || undefined,
          categoryId: r.category || undefined,
          uid,
        });
      }

      return c.body(null, 201);
    };
  }

  put() {
    return async (c: ApiContext<typeof putQuizzesQid>) => {
      const param = c.req.valid("param");
      const body = c.req.valid("json");
      const qid = param.qid;
      const question: string | undefined = body.question;
      const answer: string | undefined = body.answer;
      const anotherAnswer = body.anotherAnswer || undefined;
      const category = body.category || undefined;
      const tags = body.tags || [];
      const wid = body.wid || undefined;
      const uid = c.get("user").uid;

      if (!question || !answer || !qid) {
        throw new ApiError().invalidParams();
      }

      await this.editQuizUseCase.execute({
        qid,
        question,
        answer,
        uid,
        tagLabels: tags,
        anotherAnswer,
        categoryId: category,
        wid,
      });

      return c.body(null, 201);
    };
  }

  delete() {
    return async (c: ApiContext<typeof deleteQuizzesQid>) => {
      const param = c.req.valid("param");
      const qid = param.qid;

      if (!qid) throw new ApiError().internalProblems();

      await this.deleteQuizUseCase.execute({ qid });

      return c.body(null, 204);
    };
  }
}
