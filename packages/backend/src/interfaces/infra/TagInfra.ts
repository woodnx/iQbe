import ITagRepository from "@/domains/Tag/ITagRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";
import Tag from "@/domains/Tag";
import { sql } from "kysely";

export default class TagInfra implements ITagRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async findByLabel(label: string): Promise<Tag | null> {
    const client = this.clientManager.getClient();

    const tag = await client
      .selectFrom("tags")
      .select(["id", "label", "created"])
      .where("label", "=", label)
      .executeTakeFirst();

    if (!tag) return null;

    const usageCount = await client
      .selectFrom("tagging")
      .select(({ fn }) => [fn.count("tag_id").as("count")])
      .where("tag_id", "=", tag.id)
      .executeTakeFirst()
      .then((result) => (!!result ? Number(result.count) : 0));

    return Tag.reconstruct(tag.id, tag.label, tag.created, usageCount);
  }

  async search(q?: string, all?: boolean): Promise<Tag[]> {
    const client = this.clientManager.getClient();

    let query = client.selectFrom("tags").select(["id", "label", "created"]);

    if (!all) {
      query = query.where(
        sql`MATCH (label) AGAINST (${q} IN NATURAL LANGUAGE MODE)`,
      );
    }

    const tags = await query.execute();

    return Promise.all(
      tags.map(async (tag) => {
        const usageCount = await client
          .selectFrom("tagging")
          .select(({ fn }) => [fn.count("tag_id").as("count")])
          .where("tag_id", "=", tag.id)
          .executeTakeFirst()
          .then((result) => (!!result ? Number(result.count) : 0));

        return Tag.reconstruct(tag.id, tag.label, tag.created, usageCount);
      }),
    );
  }

  async save(tag: Tag): Promise<void> {
    const client = this.clientManager.getClient();

    await client
      .insertInto("tags")
      .values({
        label: tag.label,
        created: tag.created,
        modified: tag.created,
      })
      .onDuplicateKeyUpdate({
        modified: tag.created,
      })
      .execute();
  }

  async delete(label: string): Promise<void> {
    const client = this.clientManager.getClient();

    await client.deleteFrom("tags").where("label", "=", label).execute();
  }
}
