import IQuizRepository from "../Quiz/IQuizRepository.js";
import IUserRepository from "../User/IUserRepository.js";
import IHistoryRepository from "./IHistoryRepository.js";
import History from "./index.js";

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
    pressedWordPosition: number,
    clientAttemptId: string,
  ) {
    const [user, quiz] = await Promise.all([
      this.userRepository.findByUid(uid),
      this.quizRepository.findByQid(qid),
    ]);

    if (!user || !quiz) {
      throw new Error("no find user or quiz");
    }

    const history = new History(
      qid,
      uid,
      pressedWordPosition,
      judgement,
      new Date(),
      clientAttemptId,
    );
    const savedHistory = await this.historyRepository.add(history);

    return savedHistory.hasSameAnswer(history);
  }
}
