import Judgement from "./index.js";

export default interface IJudgementRepository {
  findByUidAndDate(uid: string, date: Date[]): Promise<Judgement>;
}
