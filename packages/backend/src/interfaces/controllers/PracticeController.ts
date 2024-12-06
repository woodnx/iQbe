import PracticeUseCase from "@/applications/usecases/PracticeUseCase";
import { typedAsyncWrapper } from "@/utils";

export default class PracticeController {
  constructor(
    private practiceUseCase: PracticeUseCase,
  ) {}

  practice() {
    return typedAsyncWrapper<"/practice", "post">(async (req, res) => {
      const uid = req.user.uid;
      const qid = req.body.qid;
      const judgement = req.body.judgement;
      const pressedWordPosition = req.body.pressedWord;

      await this.practiceUseCase.addPractice(uid, qid, judgement, pressedWordPosition);

      res.status(200).send();
    });
  }
}