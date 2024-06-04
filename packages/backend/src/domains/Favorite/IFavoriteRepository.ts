import Favorite from ".";

export default interface IFavoriteRepository {
  insert(favorite: Favorite): Promise<void>,
  delete(favorite: Favorite): Promise<void>,
}
