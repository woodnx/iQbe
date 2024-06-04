import InviteCode from ".";

export default interface IInviteCodeRepository {
  findById(id: number): Promise<InviteCode | null>
  findByCode(code: string): Promise<InviteCode | null>
  save(code: string): Promise<InviteCode>
  update(inviteCode: InviteCode): Promise<InviteCode>
}
