import HistoryService from "@/domains/History/HistoryServise";
import IHistoryRepository from "@/domains/History/IHistoryRepository";
import IQuizRepository from "@/domains/Quiz/IQuizRepository";
import IUserRepository from "@/domains/User/IUserRepository";

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
    pressedWordPosition?: number
  ) {
    const historyService = new HistoryService(
      this.userRepository,
      this.quizRepository,
      this.historyRepository,
    );

    return historyService.add(uid, qid, judgement, pressedWordPosition || null);
  }
}
