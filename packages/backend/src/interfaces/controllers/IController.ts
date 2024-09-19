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
        permission: i.permission,
      })
    });
  }

  put() {
    return typedAsyncWrapper<'/i', 'put'>(async (req, res) => {
      const username = req.body.username;
      const nickname = req.body.nickname || undefined;
      const uid = req.uid;

      const i = await this.userRepository.findByUid(uid);
      
      if (!i) throw new ApiError().invalidParams();

      i.editNickname(nickname);
      i.editUsername(username);

      await this.userRepository.update(i);

      res.send({
        uid,
        username: i.username,
        nickname: i.nickname,
        created: format(i.created),
        modified: format(i.modified),
        permission: i.permission,
      });
    })
  }
}
