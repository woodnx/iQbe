import { ApiError } from 'api';
import { nanoid } from 'nanoid';

import IInviteCodeRepository from '@/domains/InviteCode/IInviteCodeRepository';
import { typedAsyncWrapper } from '@/utils';

export default class InviteCodeController {
  constructor(
    private inviteCodeRepository: IInviteCodeRepository,
  ) {}

  get() {
    return typedAsyncWrapper<"/invite-code", "get">(async (req, res) => {
      if (!req.user.isSuperUser) 
        throw new ApiError().accessDenied();

      const status = req.query?.status || undefined;
      const sort = req.query?.sort || undefined;

      const inviteCodes = await this.inviteCodeRepository.findMany({
        status,
        sort,
      });

      res.status(200).send(inviteCodes.map(inviteCode => ({
        code: inviteCode.code,
        status: inviteCode.used,
        created: inviteCode.created,
      })));
    });
  }

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