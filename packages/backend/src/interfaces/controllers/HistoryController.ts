import IHistoryRepository from "@/domains/History/IHistoryRepository";
import { typedAsyncWrapper } from "@/utils";

export default class HistoriesController {
  constructor(private historyRepository: IHistoryRepository) {}

  get() {
    return typedAsyncWrapper<"/histories", "get">(async (req, res) => {
      const result = await this.historyRepository.getAllDates(req.user.uid);
      res.send(result);
    });
  }
}
