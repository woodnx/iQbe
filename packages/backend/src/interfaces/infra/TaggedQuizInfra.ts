import TaggedQuiz from "@/domains/TaggedQuiz";
import ITaggedQuizRepository from "@/domains/TaggedQuiz/ITaggedQuizRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class TaggedQuizInfra implements ITaggedQuizRepository {
  constructor(
    private clientManager: KyselyClientManager,
  ) {}

  async insert(taggedQuiz: TaggedQuiz): Promise<void> {
    const client = this.clientManager.getClient();

    const [ quizId, tagId ] = await Promise.all([
      client.selectFrom('quizzes')
      .select('id')
      .where('qid', '=', taggedQuiz.quiz.qid)
      .executeTakeFirstOrThrow()
      .then(quiz => quiz.id),

      client.selectFrom('tags')
      .select('id')
      .where('tid', '=', taggedQuiz.tag.tid)
      .executeTakeFirstOrThrow()
      .then(tag => tag.id),
    ]);

    await client.insertInto('tagging')
    .values({
      quiz_id: quizId,
      tag_id: tagId,
      registered: taggedQuiz.registered,
    })
    .execute();
  }

  async delete(taggedQuiz: TaggedQuiz): Promise<void> {
    const client = this.clientManager.getClient();

    const [ quizId, tagId ] = await Promise.all([
      client.selectFrom('quizzes')
      .select('id')
      .where('qid', '=', taggedQuiz.quiz.qid)
      .executeTakeFirstOrThrow()
      .then(quiz => quiz.id),

      client.selectFrom('tags')
      .select('id')
      .where('tid', '=', taggedQuiz.tag.tid)
      .executeTakeFirstOrThrow()
      .then(tag => tag.id),
    ]);

    await client.deleteFrom('tagging')
    .where(({ eb, and }) => and([
      eb('quiz_id', '=', quizId),
      eb('tag_id', '=', tagId),
    ]))
    .execute();
  }
}
