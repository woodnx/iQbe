import IJudgementRepository from "@/domains/Judgement/IJudgementRepository";
import { typedAsyncWrapper } from "@/utils";
import dayjs from "@/plugins/day";

export default class JudgementController {
  constructor(private judgementRepository: IJudgementRepository) {}

  get() {
    return typedAsyncWrapper<"/histories/{since}/{until}", "get">(
      async (req, res) => {
        const since = req.params.since;
        const until = req.params.until;
        const uid = req.user.uid;
        const date = [
          dayjs(Number(since)).toDate(),
          dayjs(Number(until)).toDate(),
        ];

        const judgement = await this.judgementRepository.findByUidAndDate(
          uid,
          date,
        );

        res.status(200).send({
          right: judgement.right,
          wrong: judgement.wrong,
          through: judgement.through,
        });
      },
    );
  }
}
