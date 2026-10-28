import { sql } from "kysely";
import RefreshToken from "@/domains/RefreshToken/index.js";
import IRefreshTokensRepository from "@/domains/RefreshToken/IRefreshTokenRepository.js";
import dayjs from "@/plugins/day.js";
import KyselyClientManager from "./kysely/KyselyClientManager.js";

export default class RefreshTokensInfra implements IRefreshTokensRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async findByUid(uid: string): Promise<RefreshToken | null> {
    const client = this.clientManager.getClient();

    const data = await client
      .selectFrom("refresh_tokens")
      .innerJoin("users", "refresh_tokens.user_id", "users.id")
      .select(({ fn, val }) => [
        fn<string>("concat", [
          sql`SUBSTRING(HEX(token), 1, 8)`,
          val("-"),
          sql`SUBSTRING(HEX(token), 9, 4)`,
          val("-"),
          sql`SUBSTRING(HEX(token), 13, 4)`,
          val("-"),
          sql`SUBSTRING(HEX(token), 17, 4)`,
          val("-"),
          sql`SUBSTRING(HEX(token), 21, 12)`,
        ]).as("token"),
        "expired",
        "uid",
      ])
      .where("users.uid", "=", uid)
      .where("refresh_tokens.expired", "=", 0)
      .where("refresh_tokens.expDate", ">", new Date())
      .orderBy("refresh_tokens.id desc")
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return new RefreshToken(data.token, data.uid);
  }

  async revokeToken(uid: string, token: string): Promise<void> {
    const client = this.clientManager.getClient();
    await client
      .updateTable("refresh_tokens")
      .set({ expired: 1 })
      .where(
        "user_id",
        "in",
        client.selectFrom("users").select("id").where("uid", "=", uid),
      )
      .where("token", "=", sql<Buffer>`UNHEX(REPLACE(${token}, '-', ''))`)
      .execute();
  }

  async revokeByUid(uid: string): Promise<void> {
    const client = this.clientManager.getClient();
    await client
      .updateTable("refresh_tokens")
      .set({ expired: 1 })
      .where(
        "user_id",
        "in",
        client.selectFrom("users").select("id").where("uid", "=", uid),
      )
      .execute();
  }

  async save(refreshToken: RefreshToken): Promise<void> {
    const client = this.clientManager.getClient();
    const expDate = dayjs().add(1, "year").toDate();

    const userId = await client
      .selectFrom("users")
      .select("id")
      .where("uid", "=", refreshToken.uid)
      .executeTakeFirstOrThrow();

    await client
      .insertInto("refresh_tokens")
      .values({
        user_id: userId.id,
        token: sql<Buffer>`UNHEX(REPLACE(${refreshToken.token}, '-', ''))`,
        expDate,
      })
      .execute();

    return;
  }
}
