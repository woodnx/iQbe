import { createError } from "@/plugins/createError";
import { findSendUser } from "@/services/UsersService";
import { typedAsyncWrapper } from "@/utils";

export const get = typedAsyncWrapper<"/i", "get">(async (req, res, next) => {
  const uid = req.uid;
  
  const user = await findSendUser({ uid });

  if (!user) {
    next(createError.create({
      title: "NO_USER",
      type: "about:blank",
      status: 401,
      detail: "No such user."
    }));
    return;
  }

  res.status(200).send(user);
});

export default {
  get,
}