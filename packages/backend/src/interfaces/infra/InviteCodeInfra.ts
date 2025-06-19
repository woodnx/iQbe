import InviteCode from "@/domains/InviteCode";
import IInviteCodeRepository from "@/domains/InviteCode/IInviteCodeRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class InviteCodeInfra implements IInviteCodeRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async findMany(query?: {
    status?: number;
    sort?: string;
  }): Promise<InviteCode[]> {
    const client = this.clientManager.getClient();

    let q = client
      .selectFrom("invite_codes")
      .select(["code", "used", "created", "updated"]);

    if (query?.status == 1 || query?.status == 0) {
      q = q.where("used", "=", query.status);
    }
    if (query?.sort == "asc") {
      q = q.orderBy("created asc");
    }
    if (query?.sort == "desc") {
      q = q.orderBy("created desc");
    }

    const data = await q.execute();

    return data.map((d) =>
      InviteCode.reconstruct(d.code, d.used > 0 ? 1 : 0, d.created, d.updated),
    );
  }

  async findById(id: number): Promise<InviteCode | null> {
    const client = this.clientManager.getClient();

    const data = await client
      .selectFrom("invite_codes")
      .select(["id", "code", "used", "created", "updated"])
      .where("id", "=", id)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return InviteCode.reconstruct(
      data.code,
      data.used > 0 ? 1 : 0,
      data.created,
      data.updated,
    );
  }

  async findByCode(code: string): Promise<InviteCode | null> {
    const client = this.clientManager.getClient();

    const data = await client
      .selectFrom("invite_codes")
      .select(["id", "code", "used", "created", "updated"])
      .where("code", "=", code)
      .executeTakeFirst();

    if (!data) {
      return null;
    }

    return InviteCode.reconstruct(
      data.code,
      data.used > 0 ? 1 : 0,
      data.created,
      data.updated,
    );
  }

  async save(code: string): Promise<void> {
    const client = this.clientManager.getClient();

    await client
      .insertInto("invite_codes")
      .values({
        code,
      })
      .executeTakeFirstOrThrow();
  }

  async update(inviteCode: InviteCode): Promise<void> {
    const client = this.clientManager.getClient();

    await client
      .updateTable("invite_codes")
      .set({
        code: inviteCode.code,
        used: inviteCode.used,
      })
      .where("code", "=", inviteCode.code)
      .executeTakeFirstOrThrow();
  }
}
