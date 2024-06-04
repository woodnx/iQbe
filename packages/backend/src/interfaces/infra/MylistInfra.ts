import Mylist from "@/domains/Mylist";
import IMylistRepository from "@/domains/Mylist/IMylistRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class MylistInfra implements IMylistRepository {
  constructor(
    private clientManager: KyselyClientManager,
  ){}

  async findByMid(mid: string): Promise<Mylist | null> {
    const client = this.clientManager.getClient();

    const mylist = await client.selectFrom('mylists')
    .innerJoin('users', 'mylists.user_id', 'users.id')
    .select([
      'mid',
      'uid as creatorUid',
      'name',
      'mylists.created as created'
    ])
    .where('mid', '=', mid)
    .executeTakeFirst();

    if (!mylist) return null;

    return new Mylist(
      // @ts-ignore
      mylist.mid,
      mylist.creatorUid,
      mylist.name,
      mylist.created,
    );
  }

  async findManyByCreatorUid(uid: string): Promise<Mylist[]> {
    const client = this.clientManager.getClient();

    const mylists = await client.selectFrom('mylists')
    .innerJoin('users', 'mylists.user_id', 'users.id')
    .select([
      'mid',
      'uid as creatorUid',
      'name',
      'mylists.created as created'
    ])
    .where('uid', '=', uid)
    .execute();

    return mylists.map(mylist => new Mylist(
      // @ts-ignore
      mylist.mid,
      mylist.creatorUid,
      mylist.name,
      mylist.created,
    ));
  }

  async save(mylist: Mylist): Promise<void> {
    const client = this.clientManager.getClient();

    const userId = await client.selectFrom('users')
    .select('id')
    .where('uid', '=', mylist.creatorUid)
    .executeTakeFirstOrThrow()
    .then(u => u.id);

    await client.insertInto('mylists')
    .values({
      mid: mylist.mid,
      name: mylist.name,
      user_id: userId,
      created: mylist.created,
      attr: 100,
    })
    .execute();
  }

  async update(mylist: Mylist): Promise<void> {
    const client = this.clientManager.getClient();

    const userId = await client.selectFrom('users')
    .select('id')
    .where('uid', '=', mylist.creatorUid)
    .executeTakeFirstOrThrow()
    .then(u => u.id);

    await client.updateTable('mylists')
    .set({
      mid: mylist.mid,
      name: mylist.name,
      user_id: userId,
      created: mylist.created,
      attr: 100,
    })
    .where('mid', '=', mylist.mid)
    .execute();
  }

  async delete(mylist: Mylist): Promise<void> {
    const client = this.clientManager.getClient();

    await client.deleteFrom('mylists')
    .where('mid', '=', mylist.mid)
    .execute();
  }
}
