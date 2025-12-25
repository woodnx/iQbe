import { ApiError } from "api";
import IUserRepository from "@/domains/User/IUserRepository";
import { format } from "@/plugins/day";
import { asyncWrapper, typedAsyncWrapper } from "@/utils";

export default class IController {
  constructor(private userRepository: IUserRepository) {}

  get() {
    return typedAsyncWrapper<"/i", "get">(async (req, res) => {
      const uid = req.user.uid;

      const i = await this.userRepository.findByUid(uid);

      if (!i) throw new ApiError().invalidParams();

      res.send({
        uid: i.uid,
        username: i.username,
        nickname: i.nickname,
        created: format(i.created),
        modified: format(i.modified),
        permission: i.permission,
        photoURL: i.photoUrl,
      });
    });
  }

  put() {
    return typedAsyncWrapper<"/i", "put">(async (req, res) => {
      const username = req.body.username;
      const nickname = req.body.nickname || undefined;
      const uid = req.user.uid;

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
        photoURL: i.photoUrl,
      });
    });
  }

  registerProfileImage() {
    return asyncWrapper(async (req, res) => {
      const file = req.file;
      const uid = req.user.uid;

      if (!file) {
        throw new ApiError({
          title: "NO_FILE",
          detail: "No file uploaded.",
          type: "about:blank",
          status: 400,
        });
      }
      const filename = file.filename;

      const i = await this.userRepository.findByUid(uid);
      if (!i) throw new ApiError().invalidParams();

      const photoUrl = `/images/${filename}`;

      i.setPhotoUrl(photoUrl);
      await this.userRepository.update(i);

      res.send({
        uid,
        username: i.username,
        nickname: i.nickname,
        created: format(i.created),
        modified: format(i.modified),
        permission: i.permission,
        photoUrl,
      });
    });
  }
}
