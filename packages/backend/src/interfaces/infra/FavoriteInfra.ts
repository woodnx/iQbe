import Favorite from "@/domains/Favorite";
import IFavoriteRepository from "@/domains/Favorite/IFavoriteRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class FavoriteInfra implements IFavoriteRepository {
  constructor(
    private clientManager: KyselyClientManager,
  ) {}

  async insert(favorite: Favorite): Promise<void> {
    const client = this.clientManager.getClient();
    const now = new Date();

    const [ quizId, userId ] = await Promise.all([
      client.selectFrom('quizzes')
      .select('id')
      .where('qid', '=', favorite.quiz.qid)
      .executeTakeFirstOrThrow()
      .then(quiz => quiz.id),

      client.selectFrom('users')
      .select('id')
      .where('uid', '=', favorite.user.uid)
      .executeTakeFirstOrThrow()
      .then(user => user.id)
    ]);
    
    client.insertInto('favorites')
    .values({
      quiz_id: quizId,
      user_id: userId,
      registered: now,
    })
    .execute();
  }

  async delete(favorite: Favorite): Promise<void> {
    const client = this.clientManager.getClient();

    const [ quizId, userId ] = await Promise.all([
      client.selectFrom('quizzes')
      .select('id')
      .where('qid', '=', favorite.quiz.qid)
      .executeTakeFirstOrThrow()
      .then(quiz => quiz.id),

      client.selectFrom('users')
      .select('id')
      .where('uid', '=', favorite.user.uid)
      .executeTakeFirstOrThrow()
      .then(user => user.id)
    ]);

    client.deleteFrom('favorites')
    .where(({ eb, and }) => and([
      eb('favorites.quiz_id', '=', quizId),
      eb('favorites.user_id', '=', userId),
    ]))
    .execute();
  }
}
