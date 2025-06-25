import Auth from "@/domains/Auth";
import AuthRepository from "@/domains/Auth/AuthRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";
import dayjs, { format } from "@/plugins/day";
import { sql } from "kysely";

export default class AuthInfra implements AuthRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async save(auth: Auth): Promise<void> {
    const client = this.clientManager.getClient();
    const created = format(dayjs().toDate());
    const expDate = dayjs().add(1, "year").toDate();

    await client
      .insertInto("users")
      .values({
        ...auth.user,
        created,
        modified: created,
      })
      .executeTakeFirstOrThrow();

    await client
      .insertInto("refresh_tokens")
      .values({
        // @ts-ignore
        user_id: auth.refreshToken.userId,
        token: sql<Buffer>`UNHEX(REPLACE(${auth.refreshToken.token}, '-', ''))`,
        expDate,
      })
      .execute();
  }
}
