import InviteCode from ".";

export default interface IInviteCodeRepository {
  findMany(query?: { status?: number, sort?: string }): Promise<InviteCode[]>
  findById(id: number): Promise<InviteCode | null>
  findByCode(code: string): Promise<InviteCode | null>
  save(code: string): Promise<void>
  update(inviteCode: InviteCode): Promise<void>
}
