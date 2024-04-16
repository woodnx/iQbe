import { typedAsyncWrapper } from "@/utils";
import { MylistsService } from "@/services/MylistsService";
import { createError } from "@/plugins/createError";

export default {
  get: typedAsyncWrapper<"/mylists", "get">(async (req, res) => {
    const userId = req.userId;
    const mylists = await MylistsService.findOwn(userId);
    
    res.status(200).send(mylists);
  }),

  post: typedAsyncWrapper<"/mylists", "post">(async (req, res, next) => {
    const listName = req.body.listName;
    const userId = req.userId;

    if (!listName) {
      next(createError.invalidParams());
      return;
    }

    const newList = await MylistsService.create(listName, userId);
  
    res.status(201).send(newList);
  }),

  put: typedAsyncWrapper<"/mylists", "put">(async (req, res, next) => {
    const mid = req.body.mid;
    const listName = req.body.listName;

    if (!listName || !mid) {
      next(createError.invalidParams());
      return
    }

    const newList = await MylistsService.update(mid, listName);
  
    res.status(201).send(newList);
  }),

  delete: typedAsyncWrapper<"/mylists", "delete">(async (req, res, next) => {
    const mid = req.body.mid;
    const userId = req.userId;

    if (!mid) {
      next(createError.invalidParams());
      return
    }

    await MylistsService.delete(mid);
    const newList = await MylistsService.findOwn(userId);
  
    res.status(201).send(newList);
  }),
}