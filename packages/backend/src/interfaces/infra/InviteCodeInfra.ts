import InviteCode from "@/domains/InviteCode";
import IInviteCodeRepository from "@/domains/InviteCode/IInviteCodeRepository";
import KyselyClientManager from "./kysely/KyselyClientManager";

export default class InviteCodeInfra implements IInviteCodeRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async findById(id: number): Promise<InviteCode | null> {
    const client = this.clientManager.getClient();

    const data = await client.selectFrom('invite_codes')
    .select([
      'id',
      'code',
      'used',
    ])
    .where('id', '=', id)
    .executeTakeFirst();

    if (!data) {
      return null;
    }

    return new InviteCode(data.code, data.used);
  }

  async findByCode(code: string): Promise<InviteCode | null> {
    const client = this.clientManager.getClient();

    const data = await client.selectFrom('invite_codes')
    .select([
      'id',
      'code',
      'used',
    ])
    .where('code', '=', code)
    .executeTakeFirst();

    if (!data) {
      return null;
    }

    return new InviteCode(data.code, data.used);
  }
  
  async save(code: string): Promise<InviteCode> {
    const client = this.clientManager.getClient();

    const data = await client.insertInto('invite_codes')
    .values({
      code
    })
    .returning([
      'id',
      'code',
      'used'
    ])
    .executeTakeFirstOrThrow();

    return new InviteCode(data.code, data.used);
  }

  // async update(id: number, updateData: Partial<InviteCode>): Promise<InviteCode> {

  // }
  async update(inviteCode: InviteCode): Promise<InviteCode> {
    const client = this.clientManager.getClient();

    const data = await client.updateTable('invite_codes')
    .set({
      code: inviteCode.code,
      used: inviteCode.used,
    })
    .returning([
      'id',
      'code',
      'used'
    ])
    .where('code', '=', inviteCode.code)
    .executeTakeFirstOrThrow();

    return new InviteCode(data.code, data.used);
  }
}
