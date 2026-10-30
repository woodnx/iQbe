import Favorite from "./index.js";

export default interface IFavoriteRepository {
  insert(favorite: Favorite): Promise<void>;
  delete(favorite: Favorite): Promise<void>;
}
