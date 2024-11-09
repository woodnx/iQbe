import IMylistRepository from '@/domains/Mylist/IMylistRepository';
import IQuizRepository from '@/domains/Quiz/IQuizRepository';
import IRegisteredQuizRepository from '@/domains/RegisteredQuiz/IResiteredQuizRepository';
import RegisteredQuizService from '@/domains/RegisteredQuiz/ResisteredQuizService';

export default class RegisterUseCase {
  constructor(
    private mylistRepository: IMylistRepository,
    private quizRepository: IQuizRepository,
    private registeredQuizRepository: IRegisteredQuizRepository,
  ) {}

  async registerQuizToMylist(qid: string, mid: string) {
    const registeredQuizService = new RegisteredQuizService(
      this.mylistRepository,
      this.quizRepository,
      this.registeredQuizRepository,
    );

    return registeredQuizService.add(mid, qid);
  }

  async unregisterQuizFromMylist(qid: string, mid: string) {
    const registeredQuizService = new RegisteredQuizService(
      this.mylistRepository,
      this.quizRepository,
      this.registeredQuizRepository,
    );

    return registeredQuizService.delete(mid, qid);
  }
}