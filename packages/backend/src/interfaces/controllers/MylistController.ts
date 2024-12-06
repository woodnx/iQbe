import { ApiError } from 'api';

import Mylist from '@/domains/Mylist';
import IMylistRepository from '@/domains/Mylist/IMylistRepository';
import MylistService from '@/domains/Mylist/MylistService';
import { format } from '@/plugins/day';
import { typedAsyncWrapper } from '@/utils';

export default class MylistController {
  constructor(
    private mylistRepository: IMylistRepository,
    private mylistService: MylistService,
  ){}

  get() {
    return typedAsyncWrapper<"/mylists", "get">(async (req, res) => {
      const uid = req.user.uid;

      const mylists = await this.mylistRepository.findManyByCreatorUid(uid);

      res.status(200).send(mylists.map(m => ({
        mid: m.mid,
        name: m.name,
        created: format(m.created)
      })));
    });
  }

  post() {
    return typedAsyncWrapper<"/mylists", "post">(async (req, res) => {
      const uid = req.user.uid;
      const listName = req.body.listName;
      const now = new Date();

      if (!listName) throw new ApiError().invalidParams();
      const mid = this.mylistService.genereateMid();
      
      const mylist = new Mylist(mid, uid, listName, now);

      await this.mylistRepository.save(mylist);

      res.send({
        mid,
        name: listName,
        created: format(now),
      });
    });
  }

  put() {
    return typedAsyncWrapper<"/mylists", "put">(async (req, res) => {
      const mid = req.body.mid;
      const listName = req.body.listName;
      if (!mid || !listName) throw new ApiError().invalidParams();

      const mylist = await this.mylistRepository.findByMid(mid);
      if (!mylist) throw new ApiError().invalidParams();
      
      mylist.rename(listName);
      await this.mylistRepository.update(mylist);

      res.send({
        mid,
        name: listName,
        created: format(mylist.created),
      });
    });
  }

  delete() {
    return typedAsyncWrapper<"/mylists", "delete">(async (req, res) => {
      const mid = req.body.mid;
      const uid = req.user.uid;
      if (!mid) throw new ApiError().invalidParams();

      const mylist = await this.mylistRepository.findByMid(mid);
      if (!mylist) throw new ApiError().invalidParams();

      await this.mylistRepository.delete(mylist);
      const mylists = await this.mylistRepository.findManyByCreatorUid(uid);

      res.send(mylists.map(m => ({
        mid: m.mid,
        name: m.name,
        created: format(m.created)
      })));
    });
  }
}
