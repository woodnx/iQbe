import IQuizRepository from "../Quiz/IQuizRepository.js";
import IUserRepository from "../User/IUserRepository.js";
import History from "./index.js";
import IHistoryRepository from "./IHistoryRepository.js";

export default class HistoryService {
  constructor(
    private userRepository: IUserRepository,
    private quizRepository: IQuizRepository,
    private historyRepository: IHistoryRepository,
  ) {}

  async add(
    uid: string,
    qid: string,
    judgement: number,
    pressedWordPosition: number | null,
  ) {
    const [user, quiz] = await Promise.all([
      this.userRepository.findByUid(uid),
      this.quizRepository.findByQid(qid),
    ]);

    if (!user || !quiz) {
      throw new Error("no find user or quiz");
    }

    const history = new History(
      quiz,
      user,
      pressedWordPosition,
      judgement,
      new Date(),
    );
    await this.historyRepository.add(history);
  }
}
