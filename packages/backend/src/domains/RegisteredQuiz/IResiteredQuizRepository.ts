import RegisteredQuiz from "./index.js";

export default interface IRegisteredQuizRepository {
  insert(registeredQuiz: RegisteredQuiz): Promise<void>;
  delete(registeredQuiz: RegisteredQuiz): Promise<void>;
}
