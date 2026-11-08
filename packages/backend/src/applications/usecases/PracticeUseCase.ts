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
    pressedWordPosition: number,
    clientAttemptId: string,
  ) {
    const historyService = new HistoryService(
      this.userRepository,
      this.quizRepository,
      this.historyRepository,
    );

    const accepted = await historyService.add(
      uid,
      qid,
      judgement,
      pressedWordPosition,
      clientAttemptId,
    );
    if (!accepted) {
      return {
        ok: false as const,
        error: {
          code: "CLIENT_ATTEMPT_ID_CONFLICT",
          message: "同じ clientAttemptId で異なる解答が登録されています",
        },
      };
    }

    return {
      ok: true as const,
      data: undefined,
    };
  }
}
