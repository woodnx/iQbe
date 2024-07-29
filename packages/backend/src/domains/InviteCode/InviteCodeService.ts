import { ApiError } from 'api';

import InviteCode from './';
import IInviteCodeRepository from './IInviteCodeRepository';

export default class InviteCodeService {
  constructor(
    private inviteCodeRepository: IInviteCodeRepository,
  ) {}

  public async checkAvailable(inviteCode: InviteCode) {
    const code = await this.inviteCodeRepository.findByCode(inviteCode.code);

    if (!code) {
      throw new ApiError({
        title: "INVALID_INVITE_CODE",
        type: "about:blank",
        status: 401,
        detail: "This invite code is invalid. Please set another invite code.",
      });
    }

    return !code.used
  }
}
