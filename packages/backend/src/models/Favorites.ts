import { DB } from "@/db/types";
import { Transaction } from "kysely";

type InsertFavorites = {
  userId: number,
  quizId: number,
  registered: string,
}

type DeleteFavorite = Omit<InsertFavorites, "registered">

export const insertFavorite = (trx: Transaction<DB>, {
  userId,
  quizId,
  registered
}: InsertFavorites) => (
  trx.insertInto('favorites')
  .values({
    user_id: userId,
    quiz_id: quizId,
    registered,
  })
  .execute()
);

export const deleteFavorite = (trx: Transaction<DB>, {
  userId,
  quizId
}: DeleteFavorite) => (
  trx.deleteFrom('favorites')
  .where(({ eb, and }) => and([
    eb('user_id', '=', userId),
    eb('quiz_id', '=', quizId),
  ]))
  .execute()
);