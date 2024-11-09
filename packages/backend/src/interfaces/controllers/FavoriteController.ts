import FavoriteUseCase from "@/applications/usecases/FavoriteUseCase";
import { typedAsyncWrapper } from "@/utils";
import { ApiError } from "api";

export default class FavoriteController {
  constructor(
    private favoriteUseCase: FavoriteUseCase,
  ) {}

  like() {
    return typedAsyncWrapper<"/like", "post">(async (req, res) => {
      const qid = req.body.qid;
      const uid = req.uid;

      if (!qid) {
        throw new ApiError().invalidParams();
      }

      await this.favoriteUseCase.addFavorite(uid, qid);

      res.status(201).send();
    });
  }

  unlike() {
    return typedAsyncWrapper<"/unlike", "post">(async (req, res) => {
      const qid = req.body.qid;
      const uid = req.uid;

      if (!qid) {
        throw new ApiError().invalidParams();
      }

      await this.favoriteUseCase.removeFavorite(uid, qid);

      res.status(201).send();
    });
  }
}
