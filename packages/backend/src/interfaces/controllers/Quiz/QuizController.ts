import IQuizQueryService from "@/applications/queryservices/IQuizQueryService.js";
import { AddQuizUseCase } from "@/applications/usecases/Quiz/AddQuizUseCase.js";
import { AddQuizzesUseCase } from "@/applications/usecases/Quiz/AddQuizzesUseCase.js";
import { DeleteQuizUseCase } from "@/applications/usecases/Quiz/DeleteQuizUseCase.js";
import { EditQuizUseCase } from "@/applications/usecases/Quiz/EditQuizUseCase.js";
import { ApiError } from "@/http/ApiError.js";
import type { ApiContext } from "@/http/context.js";
import {
  deleteQuizzesQid,
  getQuizzes,
  getQuizzesSize,
  postQuizzes,
  postQuizzesMultiple,
  putQuizzesQid,
} from "./schema.js";

export default class QuizController {
  constructor(
    private quizQueryService: IQuizQueryService,
    private addQuizUseCase: AddQuizUseCase,
    private editQuizUseCase: EditQuizUseCase,
    private deleteQuizUseCase: DeleteQuizUseCase,
    private addQuizzesUseCase: AddQuizzesUseCase,
  ) {}

  get() {
    return async (c: ApiContext<typeof getQuizzes>) => {
      const query = c.req.valid("query");
      const quizzes = await this.quizQueryService.findMany(c.get("user").uid, {
        ...query,
        wids: query.wids ?? [],
        isFavorite: query.isFavorite ?? false,
        judgements:
          query.judgements == null
            ? undefined
            : Array.isArray(query.judgements)
              ? query.judgements
              : [query.judgements],
      });
      return c.json(quizzes, 200);
    };
  }

  size() {
    return async (c: ApiContext<typeof getQuizzesSize>) => {
      const size = await this.quizQueryService.count(
        c.get("user").uid,
        c.req.valid("query"),
      );
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

      await this.addQuizzesUseCase.execute(
        uid,
        records.map((record) => ({
          question: record.question,
          answer: record.answer,
          anotherAnswer: record.anotherAnswer ?? undefined,
          tagLabels: record.tags ?? [],
          wid: record.wid ?? undefined,
          categoryId: record.category ?? undefined,
        })),
      );

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

      await this.deleteQuizUseCase.execute({ qid, uid: c.get("user").uid });

      return c.body(null, 204);
    };
  }
}
