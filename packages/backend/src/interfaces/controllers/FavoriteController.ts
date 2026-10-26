import type { ApiContext } from "@/http/context.js";
import { postLike, postUnlike } from "@/http/schemas.js";
import FavoriteUseCase from "@/applications/usecases/FavoriteUseCase.js";
import { ApiError } from "@/http/ApiError.js";

export default class FavoriteController {
  constructor(private favoriteUseCase: FavoriteUseCase) {}

  like() {
    return async (c: ApiContext<typeof postLike>) => {
      const body = c.req.valid("json");
      const qid = body.qid;
      const uid = c.get("user").uid;

      if (!qid) {
        throw new ApiError().invalidParams();
      }

      await this.favoriteUseCase.addFavorite(uid, qid);

      return c.body(null, 201);
    };
  }

  unlike() {
    return async (c: ApiContext<typeof postUnlike>) => {
      const body = c.req.valid("json");
      const qid = body.qid;
      const uid = c.get("user").uid;

      if (!qid) {
        throw new ApiError().invalidParams();
      }

      await this.favoriteUseCase.removeFavorite(uid, qid);

      return c.body(null, 201);
    };
  }
}
