import type { ApiContext } from "@/http/context.js";
import { getHistoriesSinceUntil } from "@/http/schemas.js";
import IJudgementRepository from "@/domains/Judgement/IJudgementRepository.js";
import dayjs from "@/plugins/day.js";

export default class JudgementController {
  constructor(private judgementRepository: IJudgementRepository) {}

  get() {
    return async (c: ApiContext<typeof getHistoriesSinceUntil>) => {
      const param = c.req.valid("param");
      const since = param.since;
      const until = param.until;
      const uid = c.get("user").uid;
      const date = [
        dayjs(Number(since)).toDate(),
        dayjs(Number(until)).toDate(),
      ];

      const judgement = await this.judgementRepository.findByUidAndDate(
        uid,
        date,
      );

      return c.json(
        {
          right: judgement.right,
          wrong: judgement.wrong,
          through: judgement.through,
        },
        200,
      );
    };
  }
}
