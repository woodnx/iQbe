import RegisterUseCase from "@/applications/usecases/RegisterUseCase.js";
import type { ApiContext } from "@/http/context.js";
import { postRegister, postUnregister } from "./schema.js";

export default class RegisterController {
  constructor(private registerUseCase: RegisterUseCase) {}

  register() {
    return async (c: ApiContext<typeof postRegister>) => {
      const body = c.req.valid("json");
      const qid = body.qid;
      const mid = body.mid;
      const uid = c.get("user").uid;

      await this.registerUseCase.registerQuizToMylist(qid, mid, uid);

      return c.body(null, 201);
    };
  }

  unregister() {
    return async (c: ApiContext<typeof postUnregister>) => {
      const body = c.req.valid("json");
      const qid = body.qid;
      const mid = body.mid;
      const uid = c.get("user").uid;

      await this.registerUseCase.unregisterQuizFromMylist(qid, mid, uid);

      return c.body(null, 201);
    };
  }
}
