import { db } from "@/database";
import { deleteFavorite, insertFavorite } from "@/models/Favorites"
import dayjs, { format } from "@/plugins/day";

type CreateFavorites = {
  userId: number,
  quizId: number,
}

export const createFavorite = async ({
  userId,
  quizId,
}: CreateFavorites) => {
  const registered = format(dayjs().toDate());

  await db.transaction().execute(async (trx) => {
    await insertFavorite(trx, {
      userId,
      quizId,
      registered,
    });
  });
}

export const removeFavorite = async ({
  userId,
  quizId,
}: CreateFavorites) => {
  await db.transaction().execute(async (trx) => {
    await deleteFavorite(trx, {
      userId,
      quizId,
    });
  });
}
