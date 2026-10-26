import type { ApiContext } from "@/http/context.js";
import { getInviteCode, postInviteCode } from "@/http/schemas.js";
import { ApiError } from "@/http/ApiError.js";
import { nanoid } from "nanoid";

import IInviteCodeRepository from "@/domains/InviteCode/IInviteCodeRepository.js";

export default class InviteCodeController {
  constructor(private inviteCodeRepository: IInviteCodeRepository) {}

  get() {
    return async (c: ApiContext<typeof getInviteCode>) => {
      const query = c.req.valid("query");
      if (!c.get("user").isSuperUser) throw new ApiError().accessDenied();

      const status = query?.status || undefined;
      const sort = query?.sort || undefined;

      const inviteCodes = await this.inviteCodeRepository.findMany({
        status,
        sort,
      });

      return c.json(
        inviteCodes.map((inviteCode) => ({
          code: inviteCode.code,
          status: inviteCode.used,
          created: inviteCode.created,
        })),
        200,
      );
    };
  }

  create() {
    return async (c: ApiContext<typeof postInviteCode>) => {
      if (!c.get("user").isSuperUser) throw new ApiError().accessDenied();

      const code = nanoid(8);
      await this.inviteCodeRepository.save(code);
      return c.json({ code }, 200);
    };
  }
}
