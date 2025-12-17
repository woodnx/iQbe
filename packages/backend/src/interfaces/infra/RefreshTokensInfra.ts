import { sql } from "kysely";
import RefreshToken from "@/domains/RefreshToken";
import IRefreshTokensRepository from "@/domains/RefreshToken/IRefreshTokenRepository";
import dayjs from "@/plugins/day";
import KyselyClientManager from "./kysely/KyselyClientManager";

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
      .orderBy("refresh_tokens.id desc")
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return new RefreshToken(data.token, data.uid);
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
