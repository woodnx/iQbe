import RegisterUseCase from "@/applications/usecases/RegisterUseCase";
import { typedAsyncWrapper } from "@/utils";

export default class RegisterController {
  constructor(private registerUseCase: RegisterUseCase) {}

  register() {
    return typedAsyncWrapper<"/register", "post">(async (req, res) => {
      const qid = req.body.qid;
      const mid = req.body.mid;
      const uid = req.user.uid;

      await this.registerUseCase.registerQuizToMylist(qid, mid, uid);

      res.status(201).send();
    });
  }

  unregister() {
    return typedAsyncWrapper<"/unregister", "post">(async (req, res) => {
      const qid = req.body.qid;
      const mid = req.body.mid;
      const uid = req.user.uid;

      await this.registerUseCase.unregisterQuizFromMylist(qid, mid, uid);

      res.status(201).send();
    });
  }
}
