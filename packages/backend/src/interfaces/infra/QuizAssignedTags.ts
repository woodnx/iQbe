import { QuizAttachedTags } from "@/domains/QuizAttachedTags";
import { IQuizAttachedTagsRepository } from "@/domains/QuizAttachedTags/IQuizAttachedTagsRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

export class QuizAssignedTagsInfra implements IQuizAttachedTagsRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async findByQid(qid: string): Promise<QuizAttachedTags> {
    const client = this.clientManager.getClient();

    const quizId = await client
      .selectFrom("quizzes")
      .select("id")
      .where("qid", "=", qid)
      .executeTakeFirstOrThrow()
      .then((v) => v.id);

    const labels = await client
      .selectFrom("tagging")
      .innerJoin("tags", "tags.id", "tagging.tag_id")
      .select(["tags.label"])
      .where("quiz_id", "=", quizId)
      .execute()
      .then((v) => v.map((v) => v.label));

    return QuizAttachedTags.create(qid, labels);
  }

  async save(quizAssignedTags: QuizAttachedTags) {
    const client = this.clientManager.getClient();
    const quizId = await client
      .selectFrom("quizzes")
      .select("id")
      .where("qid", "=", quizAssignedTags.qid)
      .executeTakeFirstOrThrow()
      .then((v) => v.id);

    const tagIds = await Promise.all(
      quizAssignedTags.tagLabels.map(
        async (l) =>
          await client
            .selectFrom("tags")
            .select("id")
            .where("label", "=", l)
            .executeTakeFirstOrThrow()
            .then((v) => v.id),
      ),
    );

    await client
      .insertInto("tagging")
      .values(
        tagIds.map((tagId) => ({
          tag_id: tagId,
          quiz_id: quizId,
          registered: new Date(),
        })),
      )
      .execute();
  }

  async delete(quizAssignedTags: QuizAttachedTags) {
    const client = this.clientManager.getClient();
    const quizId = await client
      .selectFrom("quizzes")
      .select("id")
      .where("qid", "=", quizAssignedTags.qid)
      .executeTakeFirstOrThrow()
      .then((v) => v.id);

    const tagIds = await Promise.all(
      quizAssignedTags.tagLabels.map(
        async (l) =>
          await client
            .selectFrom("tags")
            .select("id")
            .where("label", "=", l)
            .executeTakeFirstOrThrow()
            .then((v) => v.id),
      ),
    );

    await client
      .deleteFrom("tagging")
      .where("quiz_id", "=", quizId)
      .where("tag_id", "in", tagIds)
      .execute();
  }
}
