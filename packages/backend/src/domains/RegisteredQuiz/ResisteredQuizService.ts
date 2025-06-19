import RegisteredQuiz from ".";
import IMylistRepository from "../Mylist/IMylistRepository";
import IQuizRepository from "../Quiz/IQuizRepository";
import IRegisteredQuizRepository from "./IResiteredQuizRepository";

export default class RegisteredQuizService {
  constructor(
    private mylistRepository: IMylistRepository,
    private quizRepository: IQuizRepository,
    private registeredQuizRepository: IRegisteredQuizRepository,
  ) {}

  async add(mid: string, qid: string) {
    const [mylist, quiz] = await Promise.all([
      this.mylistRepository.findByMid(mid),
      this.quizRepository.findByQid(qid),
    ]);

    if (!mylist || !quiz) {
      throw new Error("Mylist or quiz not found");
    }

    const registeredQuiz = new RegisteredQuiz(mylist, quiz);
    return this.registeredQuizRepository.insert(registeredQuiz);
  }

  async delete(mid: string, qid: string) {
    const [mylist, quiz] = await Promise.all([
      this.mylistRepository.findByMid(mid),
      this.quizRepository.findByQid(qid),
    ]);

    if (!mylist || !quiz) {
      throw new Error("Mylist or quiz not found");
    }

    const registeredQuiz = new RegisteredQuiz(mylist, quiz);
    return this.registeredQuizRepository.delete(registeredQuiz);
  }
}
