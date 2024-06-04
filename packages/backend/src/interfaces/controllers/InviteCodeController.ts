import IInviteCodeRepository from "@/domains/InviteCode/IInviteCodeRepository";
import { typedAsyncWrapper } from "@/utils";
import { nanoid } from "nanoid";

export default class InviteCodeController {
  constructor(
    private inviteCodeRepository: IInviteCodeRepository,
  ) {}

  create() {
    return typedAsyncWrapper<"/invite-code", "post">(async (req, res) => {
      const code = nanoid(8);
      await this.inviteCodeRepository.save(code);
      res.status(200).send({ code });
    });
  }
}