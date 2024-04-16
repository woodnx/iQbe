import { db } from "@/database";
import Quizzes, { FindMany, QuizzesPaths } from "@/models/Quizzes";

export default {
  async find(userId: number, quizId: number) {
    const quiz = await Quizzes.find(quizId);

    const [ isFavorite, registerdMylist, visibleUser ] = await Promise.all([
      db.selectFrom('favorites')
      .select('quiz_id')
      .where(({ eb, and }) => and([
        eb('user_id', '=', userId),
        eb('quiz_id', '=', quizId)
      ]))
      .executeTakeFirst(),
  
      (await db.selectFrom('mylists_quizzes')
      .innerJoin('mylists', 'mylists_quizzes.mylist_id', 'mylists.id')
      .select(['mylists.mid as mid'])
      .where(({ eb, and }) => and([
        eb('mylists.user_id', '=', userId),
        eb('mylists_quizzes.quiz_id', '=', quizId)
      ]))
      .execute()).map(m => m.mid),
  
      db.selectFrom('quiz_visible_users')
      .innerJoin('users', 'users.id', 'quiz_visible_users.user_id')
      .select([ 'uid' ])
      .where(({ eb, and }) => and([
        eb('quiz_id', '=', quizId),
      ]))
      .executeTakeFirst()
    ]);
  
    return {
      ...quiz,
      right: quiz.right || 0,
      isFavorite: !!isFavorite,
      registerdMylist,
      isPublic: !visibleUser,
    };
  },

  async findMany(userId: number, option: FindMany, path?: QuizzesPaths) {
    const quizzes = await Quizzes.findMany(userId, option, path);

    return Promise.all(
      quizzes.map(async quiz => {
        const [ isFavorite, registerdMylist, visibleUser ] = await Promise.all([
          db.selectFrom('favorites')
          .select('quiz_id')
          .where(({eb, and}) => and([
            eb('user_id', '=', userId),
            eb('quiz_id', '=', quiz.id)
          ]))
          .executeTakeFirst(),
  
          (await db.selectFrom('mylists_quizzes')
          .innerJoin('mylists', 'mylists_quizzes.mylist_id', 'mylists.id')
          .select(['mylists.mid as mid'])
          .where(({eb, and}) => and([
            eb('mylists.user_id', '=', userId),
            eb('mylists_quizzes.quiz_id', '=', quiz.id)
          ]))
          .execute()).map(m => m.mid),
  
          db.selectFrom('quiz_visible_users')
          .innerJoin('users', 'users.id', 'quiz_visible_users.user_id')
          .select([ 'uid' ])
          .where(({ eb, and }) => and([
            eb('quiz_id', '=', quiz.id),
          ]))
          .executeTakeFirst()
        ]);
  
        return {
          ...quiz,
          right: quiz.right || 0,
          isFavorite: !!isFavorite,
          registerdMylist,
          isPublic: !visibleUser,
        };
    }));
  },

  async create() {
    
  }
}