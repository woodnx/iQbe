import User from "@/domains/User";
import IUsersRepository from "@/domains/User/IUserRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";
import e from "cors";

export default class UserInfra implements IUsersRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async findByUid(uid: string): Promise<User | null> {
    const client = this.clientManager.getClient();

    const data = await client
      .selectFrom("users")
      .leftJoin("profile", "profile.user_id", "users.id")
      .select([
        "id",
        "passwd",
        "uid",
        "username",
        "email",
        "users.nickname as nickname",
        "created",
        "modified",
        "permission",
        "photoUrl",
      ])
      .where("uid", "=", uid)
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
      data.photoUrl || undefined,
    );
  }

  async findByUsername(username: string): Promise<User | null> {
    const client = this.clientManager.getClient();

    const data = await client
      .selectFrom("users")
      .leftJoin("profile", "profile.user_id", "users.id")
      .select([
        "id",
        "passwd",
        "uid",
        "username",
        "email",
        "users.nickname as nickname",
        "created",
        "modified",
        "permission",
        "photoUrl",
      ])
      .where("username", "=", username)
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
      data.photoUrl || undefined,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const client = this.clientManager.getClient();

    const data = await client
      .selectFrom("users")
      .leftJoin("profile", "profile.user_id", "users.id")
      .select([
        "id",
        "passwd",
        "uid",
        "username",
        "email",
        "users.nickname as nickname",
        "created",
        "modified",
        "permission",
        "photoUrl",
      ])
      .where("email", "=", email)
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
      data.photoUrl || undefined,
    );
  }

  async findUserIdByEmail(email: string): Promise<number | null> {
    const client = this.clientManager.getClient();

    const data = await client
      .selectFrom("users")
      .select("id")
      .where("email", "=", email)
      .executeTakeFirst()
      .then((u) => u?.id);

    if (!data) {
      return null;
    }

    return data;
  }

  async findLastUserId(): Promise<number | null> {
    const client = this.clientManager.getClient();

    const data = await client
      .selectFrom("users")
      .select("id")
      .orderBy("id desc")
      .limit(1)
      .executeTakeFirst()
      .then((u) => u?.id);

    if (!data) {
      return null;
    }

    return data;
  }

  async existAnyUsers(): Promise<boolean> {
    const client = this.clientManager.getClient();

    const data = await client
      .selectFrom("users")
      .select(({ fn, val, ref }) => [fn.count<number>("id").as("count")])
      .executeTakeFirst()
      .then((d) => d?.count);

    return !!data;
  }

  async save(user: User): Promise<void> {
    const client = this.clientManager.getClient();

    await client
      .insertInto("users")
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

    const userId = await client
      .selectFrom("users")
      .select("id")
      .where("uid", "=", user.uid)
      .executeTakeFirstOrThrow()
      .then((user) => user.id);

    await client
      .insertInto("profile")
      .values({
        user_id: userId,
      })
      .execute();
  }

  async update(user: User): Promise<void> {
    const client = this.clientManager.getClient();

    await client
      .updateTable("users")
      .set({
        username: user.username,
        passwd: user.passwd,
        nickname: user.nickname || undefined,
        modified: user.modified,
        email: user.email,
        permission: user.permission,
      })
      .where("uid", "=", user.uid)
      .executeTakeFirst();

    const userId = await client
      .selectFrom("users")
      .select("id")
      .where("uid", "=", user.uid)
      .executeTakeFirstOrThrow()
      .then((user) => user.id);

    const profile = await client
      .selectFrom("profile")
      .select("user_id")
      .where("user_id", "=", userId)
      .executeTakeFirst();

    if (!!profile) {
      await client
        .updateTable("profile")
        .set({
          nickname: user.nickname,
          photoUrl: user.photoUrl,
        })
        .where("user_id", "=", userId)
        .execute();
    } else {
      await client
        .insertInto("profile")
        .values({
          user_id: userId,
          nickname: user.nickname,
          photoUrl: user.photoUrl,
        })
        .execute();
    }
  }
}
