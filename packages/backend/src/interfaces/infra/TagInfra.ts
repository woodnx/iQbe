import Tag from "@/domains/Tag";
import ITagRepository from "@/domains/Tag/ITagRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class TagInfra implements ITagRepository {
  constructor(private clientManager: KyselyClientManager) {}

  private async countTagUsage(tagId: number): Promise<number> {
    const client = this.clientManager.getClient();

    return client
      .selectFrom("tagging")
      .select(({ fn }) => [fn.count("tag_id").as("count")])
      .where("tag_id", "=", tagId)
      .executeTakeFirst()
      .then((result) => (!!result ? Number(result.count) : 0));
  }

  async findByLabel(label: string): Promise<Tag | null> {
    const client = this.clientManager.getClient();

    const tag = await client
      .selectFrom("tags")
      .select(["id", "label", "created"])
      .where("label", "=", label)
      .executeTakeFirst();

    if (!tag) return null;

    const usageCount = await this.countTagUsage(tag.id);

    return Tag.reconstruct(tag.id, tag.label, tag.created, usageCount);
  }

  async search(q?: string, all?: boolean): Promise<Tag[]> {
    const client = this.clientManager.getClient();

    let query = client.selectFrom("tags").select(["id", "label", "created"]);

    if (!all) {
      query = query.where("label", "like", `%${q}%`);
    }

    const tags = await query.execute();

    return Promise.all(
      tags.map(async (tag) => {
        const usageCount = await this.countTagUsage(tag.id);

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
