import type { ApiContext } from "@/http/context.js";
import { getHistories } from "@/http/schemas.js";
import IHistoryRepository from "@/domains/History/IHistoryRepository.js";

export default class HistoriesController {
  constructor(private historyRepository: IHistoryRepository) {}

  get() {
    return async (c: ApiContext<typeof getHistories>) => {
      const result = await this.historyRepository.getAllDates(
        c.get("user").uid,
      );
      return c.json(result, 200);
    };
  }
}
