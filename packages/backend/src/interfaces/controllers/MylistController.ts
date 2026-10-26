import type { ApiContext } from "@/http/context.js";
import {
  getMylists,
  postMylists,
  putMylists,
  deleteMylists,
} from "@/http/schemas.js";
import { ApiError } from "@/http/ApiError.js";

import Mylist from "@/domains/Mylist/index.js";
import IMylistRepository from "@/domains/Mylist/IMylistRepository.js";
import MylistService from "@/domains/Mylist/MylistService.js";

export default class MylistController {
  constructor(
    private mylistRepository: IMylistRepository,
    private mylistService: MylistService,
  ) {}

  get() {
    return async (c: ApiContext<typeof getMylists>) => {
      const uid = c.get("user").uid;

      const mylists = await this.mylistRepository.findManyByCreatorUid(uid);

      return c.json(
        mylists.map((m) => ({
          mid: m.mid,
          name: m.name,
          created: m.created,
          total: m.total,
          corrects: m.corrects,
          wrongs: m.wrongs,
          ignored: m.ignored,
          lastPracticedAt: m.lastPracticedAt,
        })),
        200,
      );
    };
  }

  post() {
    return async (c: ApiContext<typeof postMylists>) => {
      const body = c.req.valid("json");
      const uid = c.get("user").uid;
      const listName = body.listName;
      const now = new Date();

      if (!listName) throw new ApiError().invalidParams();
      const mid = this.mylistService.genereateMid();

      const mylist = new Mylist(mid, uid, listName, now, 0, 0, 0, 0, null);

      await this.mylistRepository.save(mylist);

      return c.json(
        {
          mid,
          name: listName,
          created: now,
          total: 0,
          corrects: 0,
          wrongs: 0,
          ignored: 0,
          lastPracticedAt: null,
        },
        200,
      );
    };
  }

  put() {
    return async (c: ApiContext<typeof putMylists>) => {
      const body = c.req.valid("json");
      const mid = body.mid;
      const listName = body.listName;
      if (!mid || !listName) throw new ApiError().invalidParams();

      const mylist = await this.mylistRepository.findByMid(
        mid,
        c.get("user").uid,
      );
      if (!mylist) throw new ApiError().invalidParams();

      mylist.rename(listName);
      await this.mylistRepository.update(mylist);

      return c.json(
        {
          mid,
          name: listName,
          created: mylist.created,
          total: mylist.total,
          corrects: mylist.corrects,
          wrongs: mylist.wrongs,
          ignored: mylist.ignored,
          lastPracticedAt: mylist.lastPracticedAt,
        },
        200,
      );
    };
  }

  delete() {
    return async (c: ApiContext<typeof deleteMylists>) => {
      const body = c.req.valid("json");
      const mid = body.mid;
      const uid = c.get("user").uid;
      if (!mid) throw new ApiError().invalidParams();

      const mylist = await this.mylistRepository.findByMid(
        mid,
        c.get("user").uid,
      );
      if (!mylist) throw new ApiError().invalidParams();

      await this.mylistRepository.delete(mylist);
      const mylists = await this.mylistRepository.findManyByCreatorUid(uid);

      return c.json(
        mylists.map((m) => ({
          mid: m.mid,
          name: m.name,
          created: m.created,
          total: m.total,
          corrects: m.corrects,
          wrongs: m.wrongs,
          ignored: m.ignored,
          lastPracticedAt: m.lastPracticedAt,
        })),
        200,
      );
    };
  }
}
