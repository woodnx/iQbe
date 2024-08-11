import User from "@/domains/User";
import IUsersRepository from "@/domains/User/IUserRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class UserInfra implements IUsersRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async findByUid(uid: string): Promise<User | null> {
    const client = this.clientManager.getClient();
    
    const data = await client.selectFrom('users')
    .select([
      'id',
      'passwd',
      'uid',
      'username',
      'email',
      'nickname',
      'created',
      'modified',
      'permission',
    ])
    .where('uid', '=', uid)
    .executeTakeFirst();

    if (!data) {
      return null;
    }
    
    return new User(
      data.uid, 
      data.passwd, 
      data.username, 
      data.email, 
      data.created, 
      data.modified,
      data.nickname,
      data.permission,
    );
  }

  async findByUsername(username: string): Promise<User | null> {
    const client = this.clientManager.getClient();

    const data = await client.selectFrom('users')
    .select([
      'id',
      'passwd',
      'uid',
      'username',
      'email',
      'nickname',
      'created',
      'modified',
      'permission',
    ])
    .where('username', '=', username)
    .executeTakeFirst();

    if (!data) {
      return null;
    }

    return new User(
      data.uid, 
      data.passwd, 
      data.username, 
      data.email, 
      data.created, 
      data.modified,
      data.nickname,
      data.permission,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const client = this.clientManager.getClient();

    const data = await client.selectFrom('users')
    .select([
      'id',
      'passwd',
      'uid',
      'username',
      'email',
      'nickname',
      'created',
      'modified',
      'permission',
    ])
    .where('email', '=', email)
    .executeTakeFirst();

    if (!data) {
      return null;
    }

    return new User(
      data.uid, 
      data.passwd, 
      data.username, 
      data.email, 
      data.created, 
      data.modified, 
      data.nickname, 
      data.permission,
    );
  }

  async findUserIdByEmail(email: string): Promise<number | null> {
    const client = this.clientManager.getClient();

    const data = await client.selectFrom('users')
    .select('id')
    .where('email', '=', email)
    .executeTakeFirst()
    .then(u => u?.id);

    if (!data) {
      return null;
    }

    return data;
  }
  
  async findLastUserId(): Promise<number | null> {
    const client = this.clientManager.getClient();

    const data = await client.selectFrom('users')
    .select('id')
    .orderBy('id desc')
    .limit(1)
    .executeTakeFirst()
    .then(u => u?.id);

    if (!data) {
      return null;
    }

    return data;
  }

  async existAnyUsers(): Promise<boolean> {
    const client = this.clientManager.getClient();

    const data = await client.selectFrom('users')
    .select(({ fn, val, ref }) => [
      fn.count<number>('id').as('count')
    ])
    .executeTakeFirst()
    .then(d => d?.count);

    return !!data;
  }

  async save(user: User): Promise<void> {
    const client = this.clientManager.getClient();

    await client.insertInto('users')
    .values({
      username: user.username,
      uid: user.uid,
      passwd: user.passwd,
      nickname: user.nickname || undefined,
      email: user.email,
      created: user.created,
      modified: user.modified,
      permission: user.permission,
    })
    .executeTakeFirst();
  }

  async update(user: User): Promise<void> {
    const client = this.clientManager.getClient();

    await client.updateTable('users')
    .set({
      username: user.username,
      passwd: user.passwd,
      nickname: user.nickname || undefined,
      modified: user.modified,
      email: user.email,
      permission: user.permission,
    })
    .where('uid', '=', user.uid)
    .executeTakeFirst();
  }
}
