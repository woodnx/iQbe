import HistoryService from "@/domains/History/HistoryServise.js";
import IHistoryRepository from "@/domains/History/IHistoryRepository.js";
import IQuizRepository from "@/domains/Quiz/IQuizRepository.js";
import IUserRepository from "@/domains/User/IUserRepository.js";

export default class PracticeUseCase {
  constructor(
    private userRepository: IUserRepository,
    private quizRepository: IQuizRepository,
    private historyRepository: IHistoryRepository,
  ) {}

  async addPractice(
    uid: string,
    qid: string,
    judgement: number,
    pressedWordPosition?: number,
  ) {
    const historyService = new HistoryService(
      this.userRepository,
      this.quizRepository,
      this.historyRepository,
    );

    return historyService.add(uid, qid, judgement, pressedWordPosition || null);
  }
}
