import { ApiError } from 'api';
import { nanoid } from 'nanoid';

import IInviteCodeRepository from '@/domains/InviteCode/IInviteCodeRepository';
import { typedAsyncWrapper } from '@/utils';

export default class InviteCodeController {
  constructor(
    private inviteCodeRepository: IInviteCodeRepository,
  ) {}

  create() {
    return typedAsyncWrapper<"/invite-code", "post">(async (req, res) => {
      if (!req.user.isSuperUser) 
        throw new ApiError().accessDenied();

      const code = nanoid(8);
      await this.inviteCodeRepository.save(code);
      res.status(200).send({ code });
    });
  }
}