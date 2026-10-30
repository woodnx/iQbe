import { ApiError } from "@/http/ApiError.js";
import IMylistRepository from "../Mylist/IMylistRepository.js";
import IQuizRepository from "../Quiz/IQuizRepository.js";
import IRegisteredQuizRepository from "./IResiteredQuizRepository.js";
import RegisteredQuiz from "./index.js";

export default class RegisteredQuizService {
  constructor(
    private mylistRepository: IMylistRepository,
    private quizRepository: IQuizRepository,
    private registeredQuizRepository: IRegisteredQuizRepository,
  ) {}

  async add(mid: string, qid: string, uid: string) {
    const [mylist, quiz] = await Promise.all([
      this.mylistRepository.findByMid(mid, uid),
      this.quizRepository.findByQid(qid),
    ]);

    if (!mylist || !quiz) {
      throw new ApiError().notFound("Mylist or quiz not found.");
    }

    const registeredQuiz = new RegisteredQuiz(mylist, quiz);
    return this.registeredQuizRepository.insert(registeredQuiz);
  }

  async delete(mid: string, qid: string, uid: string) {
    const [mylist, quiz] = await Promise.all([
      this.mylistRepository.findByMid(mid, uid),
      this.quizRepository.findByQid(qid),
    ]);

    if (!mylist || !quiz) {
      throw new ApiError().notFound("Mylist or quiz not found.");
    }

    const registeredQuiz = new RegisteredQuiz(mylist, quiz);
    return this.registeredQuizRepository.delete(registeredQuiz);
  }
}
