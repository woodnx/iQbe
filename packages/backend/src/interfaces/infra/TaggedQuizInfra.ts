import TaggedQuiz from "@/domains/TaggedQuiz";
import ITaggedQuizRepository from "@/domains/TaggedQuiz/ITaggedQuizRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";
import Tag from "@/domains/Tag";

export default class TaggedQuizInfra implements ITaggedQuizRepository {
  constructor(
    private clientManager: KyselyClientManager,
  ) {}

  async findByQid(qid: string): Promise<TaggedQuiz[]> {
    const client = this.clientManager.getClient();

    const quizId = await client.selectFrom('quizzes')
    .select('id')
    .where('qid', '=', qid)
    .executeTakeFirstOrThrow()
    .then(quiz => quiz.id);

    const tagIds = await client.selectFrom('tagging')
    .select('tag_id')
    .where('quiz_id', '=', quizId)
    .execute()
    .then(taggings => taggings.map(tagging => tagging.tag_id));

    const tags = await Promise.all(tagIds.map(async (tagId) => {
      const _tag = await client
      .selectFrom('tags')
      .select([
        'label',
      ])
      .where('id', '=', tagId)
      .executeTakeFirstOrThrow();

      const tag = new Tag(_tag?.label);

      return tag;
    }));

    return tags.map(tag => new TaggedQuiz(qid, tag));
  }

  async count(taggedQuiz: TaggedQuiz): Promise<number> {
    const client = this.clientManager.getClient();

    const [ quizId, tagId ] = await Promise.all([
      client.selectFrom('quizzes')
      .select('id')
      .where('qid', '=', taggedQuiz.qid)
      .executeTakeFirstOrThrow()
      .then(quiz => quiz.id),

      client.selectFrom('tags')
      .select('id')
      .where('label', '=', taggedQuiz.tag.label)
      .executeTakeFirstOrThrow()
      .then(tag => tag.id),
    ]);

    const count = await client.selectFrom('tagging')
    .select(({ fn }) => [
      fn.count('quiz_id').as('count')
    ])
    .where(({ and, eb }) => and([
      eb('quiz_id', '=', quizId),
      eb('tag_id', '=', tagId)
    ]))
    .executeTakeFirst()
    .then(data => data?.count || 0);

    return Number(count);
  }

  async insert(taggedQuiz: TaggedQuiz): Promise<void> {
    const client = this.clientManager.getClient();

    const [ quizId, tagId ] = await Promise.all([
      client.selectFrom('quizzes')
      .select('id')
      .where('qid', '=', taggedQuiz.qid)
      .executeTakeFirstOrThrow()
      .then(quiz => quiz.id),
      
      client
      .selectFrom('tags')
      .select('id')
      .where('label', '=', taggedQuiz.tag.label)
      .executeTakeFirstOrThrow()
      .then(tag => tag.id),
    ]);

    const now = new Date();

    await client.insertInto('tagging')
    .values({
      quiz_id: quizId,
      tag_id: tagId,
      registered: now,
    })
    .execute();
  }

  async delete(taggedQuiz: TaggedQuiz): Promise<void> {
    const client = this.clientManager.getClient();

    const [ quizId, tagId ] = await Promise.all([
      client.selectFrom('quizzes')
      .select('id')
      .where('qid', '=', taggedQuiz.qid)
      .executeTakeFirstOrThrow()
      .then(quiz => quiz.id),

      client.selectFrom('tags')
      .select('id')
      .where('label', '=', taggedQuiz.tag.label)
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
