import Judgement from ".";

export default interface IJudgementRepository {
  findByUidAndDate(uid: string, date: Date[]): Promise<Judgement>;
}
