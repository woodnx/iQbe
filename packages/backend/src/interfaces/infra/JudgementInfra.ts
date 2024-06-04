import Judgement from "@/domains/Judgement";
import IJudgementRepository from "@/domains/Judgement/IJudgementRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class JudgementInfra implements IJudgementRepository {
  constructor(
    private clientManager: KyselyClientManager,
  ) {}

  async findByUidAndDate(uid: string, date: Date[]): Promise<Judgement> {
    const client = this.clientManager.getClient();

    const userId = await client.selectFrom('users')
    .select('id')
    .where('uid', '=', uid)
    .executeTakeFirstOrThrow()
    .then(user => user.id);

    const [ right, wrong, through ] = await Promise.all([
      client.selectFrom('histories')
      .select(({ fn }) => [
        fn.count('quiz_id').as('right')
      ])
      .where(({ and, eb, between }) => and([
        eb('judgement', '=', 1),
        eb('user_id', '=', userId),
        between('practiced', date[0], date[1]),
      ]))
      .executeTakeFirstOrThrow()
      .then(result => result.right),

      client.selectFrom('histories')
      .select(({ fn }) => [
        fn.count('quiz_id').as('wrong')
      ])
      .where(({ and, eb, between }) => and([
        eb('judgement', '=', 0),
        eb('user_id', '=', userId),
        between('practiced', date[0], date[1]),
      ]))
      .executeTakeFirstOrThrow()
      .then(result => result.wrong),

      client.selectFrom('histories')
      .select(({ fn }) => [
        fn.count('quiz_id').as('through')
      ])
      .where(({ and, eb, between }) => and([
        eb('judgement', '=', 2),
        eb('user_id', '=', userId),
        between('practiced', date[0], date[1]),
      ]))
      .executeTakeFirstOrThrow()
      .then(result => result.through),
    ]);

    return new Judgement(Number(right), Number(wrong), Number(through));
  }
}