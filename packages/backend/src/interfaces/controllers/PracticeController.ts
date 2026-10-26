import type { ApiContext } from "@/http/context.js";
import { postPractice } from "@/http/schemas.js";
import PracticeUseCase from "@/applications/usecases/PracticeUseCase.js";

export default class PracticeController {
  constructor(private practiceUseCase: PracticeUseCase) {}

  practice() {
    return async (c: ApiContext<typeof postPractice>) => {
      const body = c.req.valid("json");
      const uid = c.get("user").uid;
      const qid = body.qid;
      const judgement = body.judgement;
      const pressedWordPosition = body.pressedWord;

      await this.practiceUseCase.addPractice(
        uid,
        qid,
        judgement,
        pressedWordPosition,
      );

      return c.body(null, 200);
    };
  }
}
