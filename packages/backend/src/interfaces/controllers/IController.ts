import IUserRepository from "@/domains/User/IUserRepository";
import { format } from "@/plugins/day";
import { typedAsyncWrapper } from "@/utils";
import { ApiError } from "api";

export default class IController {
  constructor(
    private userRepository: IUserRepository
  ) {}

  get() {
    return typedAsyncWrapper<'/i', 'get'>(async (req, res) => {
      const uid = req.uid;

      const i = await this.userRepository.findByUid(uid);

      if (!i) throw new ApiError().invalidParams();

      res.send({
        uid: i.uid,
        username: i.username,
        nickname: i.nickname,
        created: format(i.created),
        modified: format(i.modified),
      })
    });
  }
}
