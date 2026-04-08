import { ApiError } from "api";

import Mylist from "@/domains/Mylist";
import IMylistRepository from "@/domains/Mylist/IMylistRepository";
import MylistService from "@/domains/Mylist/MylistService";
import { typedAsyncWrapper } from "@/utils";

export default class MylistController {
  constructor(
    private mylistRepository: IMylistRepository,
    private mylistService: MylistService,
  ) {}

  get() {
    return typedAsyncWrapper<"/mylists", "get">(async (req, res) => {
      const uid = req.user.uid;

      const mylists = await this.mylistRepository.findManyByCreatorUid(uid);

      res.status(200).send(
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
      );
    });
  }

  post() {
    return typedAsyncWrapper<"/mylists", "post">(async (req, res) => {
      const uid = req.user.uid;
      const listName = req.body.listName;
      const now = new Date();

      if (!listName) throw new ApiError().invalidParams();
      const mid = this.mylistService.genereateMid();

      const mylist = new Mylist(mid, uid, listName, now, 0, 0, 0, 0, null);

      await this.mylistRepository.save(mylist);

      res.send({
        mid,
        name: listName,
        created: now,
        total: 0,
        corrects: 0,
        wrongs: 0,
        ignored: 0,
        lastPracticedAt: null,
      });
    });
  }

  put() {
    return typedAsyncWrapper<"/mylists", "put">(async (req, res) => {
      const mid = req.body.mid;
      const listName = req.body.listName;
      if (!mid || !listName) throw new ApiError().invalidParams();

      const mylist = await this.mylistRepository.findByMid(mid, req.user.uid);
      if (!mylist) throw new ApiError().invalidParams();

      mylist.rename(listName);
      await this.mylistRepository.update(mylist);

      res.send({
        mid,
        name: listName,
        created: mylist.created,
        total: mylist.total,
        corrects: mylist.corrects,
        wrongs: mylist.wrongs,
        ignored: mylist.ignored,
        lastPracticedAt: mylist.lastPracticedAt,
      });
    });
  }

  delete() {
    return typedAsyncWrapper<"/mylists", "delete">(async (req, res) => {
      const mid = req.body.mid;
      const uid = req.user.uid;
      if (!mid) throw new ApiError().invalidParams();

      const mylist = await this.mylistRepository.findByMid(mid, req.user.uid);
      if (!mylist) throw new ApiError().invalidParams();

      await this.mylistRepository.delete(mylist);
      const mylists = await this.mylistRepository.findManyByCreatorUid(uid);

      res.send(
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
      );
    });
  }
}
