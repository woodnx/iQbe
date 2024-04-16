import { createInviteCode } from "@/services/InviteCodeService";
import { typedAsyncWrapper } from "@/utils";

const get = typedAsyncWrapper<"/invite-code", "post">(async (req, res) => {
  const code = await createInviteCode();
  res.status(200).send({ code });
});

export default {
  get
}