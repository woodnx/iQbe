import { db } from "@/database";
import { DB } from "@/db/types";
import { Transaction } from "kysely";

export type CountJudement = {
  judgement: number,
  userId: number,
  since: Date,
  until: Date,
}

export type InsertHistory = {
  quizId: number,
  userId: number,
  practiced: string,
  judgement: number,
  pressedWord?: number | null,
}

export const countJudement = ({
  judgement,
  userId,
  since,
  until
}: CountJudement) => (
  db.selectFrom('histories')
  .select(({ fn }) => [
    fn.count('quiz_id').as('count')
  ])
  .where(({ eb, and, between }) => and([
    eb('user_id', '=', userId),
    eb('judgement', '=', judgement),
    between('practiced', since, until)
  ]))
  .executeTakeFirst()
);

export const insertHistory =  (trx: Transaction<DB>, {
  userId,
  quizId,
  practiced,
  judgement,
  pressedWord,
}: InsertHistory) => (
  trx
  .insertInto('histories')
  .values({
    user_id: userId,
    quiz_id: quizId,
    practiced,
    judgement,
    pressed_word: pressedWord
  })
  .execute()
);