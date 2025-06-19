import FavoriteService from "@/domains/Favorite/FavoriteService";
import IFavoriteRepository from "@/domains/Favorite/IFavoriteRepository";
import IQuizRepository from "@/domains/Quiz/IQuizRepository";
import IUserRepository from "@/domains/User/IUserRepository";

export default class FavoriteUseCase {
  constructor(
    private favoriteRepository: IFavoriteRepository,
    private quizRepository: IQuizRepository,
    private userRepository: IUserRepository,
  ) {}

  async addFavorite(uid: string, qid: string) {
    const favoriteService = new FavoriteService(
      this.userRepository,
      this.quizRepository,
      this.favoriteRepository,
    );

    return favoriteService.add(uid, qid);
  }

  async removeFavorite(uid: string, qid: string) {
    const favoriteService = new FavoriteService(
      this.userRepository,
      this.quizRepository,
      this.favoriteRepository,
    );

    return favoriteService.delete(uid, qid);
  }
}
