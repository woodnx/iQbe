import { Hono } from "hono";
import RegisterUseCase from "@/applications/usecases/RegisterUseCase.js";
import MylistService from "@/domains/Mylist/MylistService.js";
import { ApiError } from "@/http/ApiError.js";
import type { AppEnv } from "@/http/context.js";
import { validate } from "@/http/validate.js";
import MylistController from "@/interfaces/controllers/Mylist/MylistController.js";
import {
  deleteMylists,
  deleteMylistsQuiz,
  postMylists,
  putMylists,
  putMylistsQuiz,
} from "@/interfaces/controllers/Mylist/schema.js";
import CategoryInfra from "@/interfaces/infra/CategoryInfra.js";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager.js";
import MylistInfra from "@/interfaces/infra/MylistInfra.js";
import QuizInfra from "@/interfaces/infra/QuizInfra.js";
import RegisteredQuizInfra from "@/interfaces/infra/ResisteredQuizInfra.js";

const clientManager = new KyselyClientManager();
const mylistInfra = new MylistInfra(clientManager);

const mylistController = new MylistController(mylistInfra, new MylistService());

const quizInfra = new QuizInfra(
  clientManager,
  new CategoryInfra(clientManager),
);
const registration = new RegisterUseCase(
  mylistInfra,
  quizInfra,
  new RegisteredQuizInfra(clientManager),
);

async function resolveQid(quizId: number): Promise<string> {
  const qid = await quizInfra.findQidById(quizId);
  if (qid == null) throw new ApiError().notFound("Quiz not found.");
  return qid;
}

const router = new Hono<AppEnv>()
  .get("/", mylistController.get())
  .post("/", validate("json", postMylists.json), mylistController.post())
  .put("/", validate("json", putMylists.json), mylistController.put())
  .delete("/", validate("json", deleteMylists.json), mylistController.delete())
  .put("/quiz", validate("json", putMylistsQuiz.json), async (c) => {
    const { quizId, mid } = c.req.valid("json");
    await registration.registerQuizToMylist(
      await resolveQid(quizId),
      mid,
      c.get("user").uid,
    );
    return c.text(`1 new quizzes saved into mylist (mylist: ${mid})`, 201);
  })
  .delete("/quiz", validate("json", deleteMylistsQuiz.json), async (c) => {
    const { quizId, mid } = c.req.valid("json");
    await registration.unregisterQuizFromMylist(
      await resolveQid(quizId),
      mid,
      c.get("user").uid,
    );
    return c.body(null, 204);
  });
export default router;
