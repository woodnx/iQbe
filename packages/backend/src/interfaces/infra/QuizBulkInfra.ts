import { sql } from "kysely";
import type IQuizBulkRepository from "@/domains/Quiz/IQuizBulkRepository.js";
import type { QuizBulkRecord } from "@/domains/Quiz/IQuizBulkRepository.js";
import { ApiError } from "@/http/ApiError.js";
import KyselyClientManager from "./kysely/KyselyClientManager.js";

export default class QuizBulkInfra implements IQuizBulkRepository {
  constructor(private clients: KyselyClientManager) {}

  async saveMany(records: QuizBulkRecord[], uid: string): Promise<void> {
    const client = this.clients.getClient();
    const user = await client
      .selectFrom("users")
      .select("id")
      .where("uid", "=", uid)
      .executeTakeFirstOrThrow();
    const wids = [
      ...new Set(records.flatMap(({ quiz }) => (quiz.wid ? [quiz.wid] : []))),
    ];
    const categoryIds = [
      ...new Set(
        records.flatMap(({ quiz }) =>
          quiz.categoryId == null ? [] : [quiz.categoryId],
        ),
      ),
    ];
    const [workbookIds, categories] = await Promise.all([
      this.resolveIds("workbooks", "wid", wids, user.id),
      categoryIds.length
        ? client
            .selectFrom("categories")
            .select("id")
            .where("id", "in", categoryIds)
            .execute()
        : Promise.resolve([]),
    ]);
    if (
      workbookIds.size !== wids.length ||
      categories.length !== categoryIds.length
    )
      throw new ApiError().invalidParams("Unknown workbook or category.");
    const labels = [
      ...new Set(records.flatMap((record) => record.tagLabels)),
    ].sort();
    const now = new Date();
    for (let offset = 0; offset < labels.length; offset += 1000) {
      await client
        .insertInto("tags")
        .values(
          labels
            .slice(offset, offset + 1000)
            .map((label) => ({ label, created: now, modified: now })),
        )
        .onDuplicateKeyUpdate({ modified: sql`modified` })
        .execute();
    }
    const tagIds = await this.resolveIds("tags", "label", labels);
    await client
      .insertInto("quizzes")
      .values(
        records.map(({ quiz }) => ({
          qid: quiz.qid,
          que: quiz.question,
          ans: quiz.answer,
          anoans: quiz.anotherAnswer,
          creator_id: user.id,
          workbook_id: quiz.wid ? workbookIds.get(quiz.wid)! : null,
          category_id: quiz.categoryId,
        })),
      )
      .execute();
    const quizRows = await client
      .selectFrom("quizzes")
      .select(["id", "qid"])
      .where(
        "qid",
        "in",
        records.map(({ quiz }) => quiz.qid),
      )
      .execute();
    const quizIds = new Map(quizRows.map((row) => [row.qid, row.id]));
    const tagging = records.flatMap(({ quiz, tagLabels }) =>
      [...new Set(tagLabels.map((label) => tagIds.get(label)!))].map(
        (tagId) => ({
          quiz_id: quizIds.get(quiz.qid)!,
          tag_id: tagId,
          registered: now,
        }),
      ),
    );
    // Bound statement sizes independently of the maximum number of quiz rows.
    for (let offset = 0; offset < tagging.length; offset += 1000)
      await client
        .insertInto("tagging")
        .values(tagging.slice(offset, offset + 1000))
        .execute();
  }

  // Match using the column's MySQL collation, while retaining each input spelling.
  // A JavaScript lowercase map would miss accent/case equivalence in the DB.
  private async resolveIds(
    table: "workbooks" | "tags",
    column: "wid" | "label",
    values: string[],
    ownerId?: number,
  ) {
    const ids = new Map<string, number>();
    for (let offset = 0; offset < values.length; offset += 1000) {
      const requested = sql.join(
        values
          .slice(offset, offset + 1000)
          .map((value) => sql`SELECT ${value} AS label`),
        sql` UNION ALL `,
      );
      const result = await sql<{ requested: string; id: number }>`
        SELECT requested.label AS requested, target.id
        FROM (${requested}) AS requested
        JOIN ${sql.table(table)} AS target ON ${sql.ref(`target.${column}`)} = requested.label
        ${ownerId == null ? sql`` : sql`WHERE target.creator_id = ${ownerId}`}
      `.execute(this.clients.getClient());
      for (const row of result.rows) ids.set(row.requested, row.id);
    }
    return ids;
  }
}
