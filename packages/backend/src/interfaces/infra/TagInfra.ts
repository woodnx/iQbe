import ITagRepository from "@/domains/Tag/ITagRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";
import Tag from "@/domains/Tag";
import { sql } from "kysely";

export default class TagInfra implements ITagRepository {
  constructor(
    private clientManager: KyselyClientManager,
  ) {}

  async findByLabel(label: string): Promise<Tag | null> {
    const client = this.clientManager.getClient();

    const tag = await client.selectFrom('tags')
    .select(['label'])
    .where('label', '=', label)
    .executeTakeFirst();

    if (!tag) return null;

    return new Tag(tag.label);
  }

  async search(q?: string): Promise<Tag[]> {
    const client = this.clientManager.getClient();

    const tags = await client.selectFrom('tags')
    .select(['label'])
    .where(sql`MATCH (label) AGAINST (${q} IN NATURAL LANGUAGE MODE)`)
    .execute();

    return tags.map(tag => new Tag(tag.label));
  }

  async save(tag: Tag): Promise<void> {
    const client = this.clientManager.getClient();

    await client.insertInto('tags')
    .values({
      label: tag.label,
      created: tag.created,
      modified: tag.created,
    })
    .execute();
  }

  async delete(label: string): Promise<void> {
    const client = this.clientManager.getClient();

    await client.deleteFrom('tags')
    .where('label', '=', label)
    .execute();
  }
}
