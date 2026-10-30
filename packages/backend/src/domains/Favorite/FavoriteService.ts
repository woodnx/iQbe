import Favorite from "./index.js";
import IQuizRepository from "../Quiz/IQuizRepository.js";
import IUserRepository from "../User/IUserRepository.js";
import IFavoriteRepository from "./IFavoriteRepository.js";

export default class FavoriteService {
  constructor(
    private userRepository: IUserRepository,
    private quizRepository: IQuizRepository,
    private favoriteRepository: IFavoriteRepository,
  ) {}

  async add(uid: string, qid: string) {
    const [user, quiz] = await Promise.all([
      this.userRepository.findByUid(uid),
      this.quizRepository.findByQid(qid),
    ]);

    if (!user || !quiz) {
      throw new Error("User or quiz not found");
    }

    const favorite = new Favorite(user, quiz);
    return this.favoriteRepository.insert(favorite);
  }

  async delete(uid: string, qid: string) {
    const [user, quiz] = await Promise.all([
      this.userRepository.findByUid(uid),
      this.quizRepository.findByQid(qid),
    ]);

    if (!user || !quiz) {
      throw new Error("User or item not found");
    }

    const favorite = new Favorite(user, quiz);
    return this.favoriteRepository.delete(favorite);
  }
}
