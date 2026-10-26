import fs from "node:fs/promises";
import path from "node:path";
import type { ApiContext } from "@/http/context.js";
import { getI, putI, postIImage } from "@/http/schemas.js";
import { ApiError } from "@/http/ApiError.js";
import IUserRepository from "@/domains/User/IUserRepository.js";
import { format } from "@/plugins/day.js";

export default class IController {
  constructor(private userRepository: IUserRepository) {}

  get() {
    return async (c: ApiContext<typeof getI>) => {
      const uid = c.get("user").uid;

      const i = await this.userRepository.findByUid(uid);

      if (!i) throw new ApiError().invalidParams();

      return c.json(
        {
          uid: i.uid,
          username: i.username,
          nickname: i.nickname,
          created: format(i.created),
          modified: format(i.modified),
          permission: i.permission,
          photoURL: i.photoUrl,
        },
        200,
      );
    };
  }

  put() {
    return async (c: ApiContext<typeof putI>) => {
      const body = c.req.valid("json");
      const username = body.username;
      const nickname = body.nickname || undefined;
      const uid = c.get("user").uid;

      const i = await this.userRepository.findByUid(uid);

      if (!i) throw new ApiError().invalidParams();

      i.editNickname(nickname);
      i.editUsername(username);

      await this.userRepository.update(i);

      return c.json(
        {
          uid,
          username: i.username,
          nickname: i.nickname,
          created: format(i.created),
          modified: format(i.modified),
          permission: i.permission,
          photoURL: i.photoUrl,
        },
        200,
      );
    };
  }

  registerProfileImage() {
    return async (c: ApiContext<typeof postIImage>) => {
      const file = c.req.valid("form").file;
      const uid = c.get("user").uid;

      if (!file) {
        throw new ApiError({
          title: "NO_FILE",
          detail: "No file uploaded.",
          type: "about:blank",
          status: 400,
        });
      }
      const filename = `${uid}.png`;
      const directory = path.join(process.cwd(), "public/images");
      await fs.mkdir(directory, { recursive: true });
      await fs.writeFile(
        path.join(directory, filename),
        Buffer.from(await file.arrayBuffer()),
      );

      const i = await this.userRepository.findByUid(uid);
      if (!i) throw new ApiError().invalidParams();

      const photoUrl = `/images/${filename}`;

      i.setPhotoUrl(photoUrl);
      await this.userRepository.update(i);

      return c.json({
        uid,
        username: i.username,
        nickname: i.nickname,
        created: format(i.created),
        modified: format(i.modified),
        permission: i.permission,
        photoUrl,
      });
    };
  }
}
