import History from "./index.js";

export default interface IHistoryRepository {
  getAllDates(uid: string): Promise<Date[]>;
  add(history: History): Promise<void>;
}
