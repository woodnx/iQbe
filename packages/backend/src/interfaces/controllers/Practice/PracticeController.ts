import PracticeUseCase from "@/applications/usecases/PracticeUseCase.js";
import type { ApiContext } from "@/http/context.js";
import { postPractice } from "./schema.js";

export default class PracticeController {
  constructor(private practiceUseCase: PracticeUseCase) {}

  practice() {
    return async (c: ApiContext<typeof postPractice>) => {
      const body = c.req.valid("json");
      const uid = c.get("user").uid;
      const qid = body.qid;
      const judgement = body.judgement;
      const pressedWordPosition = body.pressedWord;
      const clientAttemptId = body.clientAttemptId;

      const result = await this.practiceUseCase.addPractice(
        uid,
        qid,
        judgement,
        pressedWordPosition,
        clientAttemptId,
      );

      if (!result.ok) {
        if (result.error.code === "QUIZ_NOT_FOUND") {
          return c.json(result.error, 404);
        }
        return c.json(result.error, 409);
      }

      return c.json(result.data, 200);
    };
  }
}
