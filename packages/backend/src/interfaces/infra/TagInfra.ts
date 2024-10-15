import ITagRepository from "@/domains/Tag/ITagRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";
import Tag from "@/domains/Tag";

export default class TagInfra implements ITagRepository {
  constructor(
    private clientManager: KyselyClientManager,
  ) {}

  async findByTid(tid: string): Promise<Tag | null> {
    const client = this.clientManager.getClient();

    const tag = await client.selectFrom('tags')
    .innerJoin('users', 'tags.creator_id', 'users.id')
    .select([
      'tid',
      'label',
      'color',
      'description',
      'tags.created as created',
      'tags.modified as modified',
      'users.uid as creator_uid',
    ])
    .where('tid', '=', tid)
    .executeTakeFirst();

    if (!tag) return null;

    return new Tag(
      tag.tid,
      tag.label,
      tag.color,
      tag.description,
      tag.created,
      tag.modified,
      tag.creator_uid,
    );
  }

  async findOwn(uid: string): Promise<Tag[]> {
    const client = this.clientManager.getClient();

    const tags = await client.selectFrom('tags')
    .innerJoin('users', 'tags.creator_id', 'users.id')
    .select([
      'tid',
      'label',
      'color',
      'description',
      'tags.created as created',
      'tags.modified as modified',
      'users.uid as creator_uid',
    ])
    .where('users.uid', '=', uid)
    .execute();

    const result = tags.map((tag) => new Tag(
      tag.tid,
      tag.label,
      tag.color,
      tag.description,
      tag.created,
      tag.modified,
      tag.creator_uid,
    ));

    return result;
  }

  async save(tag: Tag): Promise<void> {
    const client = this.clientManager.getClient();

    const userId = await client.selectFrom('users')
    .select('id')
    .where('uid', '=', tag.creatorUid)
    .executeTakeFirstOrThrow()
    .then(user => user.id);

    await client.insertInto('tags')
    .values({
      tid: tag.tid,
      label: tag.label,
      color: tag.color,
      description: tag.description,
      created: tag.created,
      modified: tag.modified,
      creator_id: userId,
    })
    .execute();
  }

  async update(tag: Tag): Promise<void> {
    const client = this.clientManager.getClient();

    await client.updateTable('tags')
    .set({
      label: tag.label,
      color: tag.color,
      description: tag.description,
      created: tag.created,
      modified: tag.modified,
    })
    .where('tid', '=', tag.tid)
    .execute();
  }

  async delete(tid: string): Promise<void> {
    const client = this.clientManager.getClient();

    await client.deleteFrom('tags')
    .where('tid', '=', tid)
    .execute();
  }
}
