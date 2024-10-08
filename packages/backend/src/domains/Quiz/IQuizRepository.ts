import Quiz from ".";

export default interface IQuizRepository {
  findByQid(qid: string): Promise<Quiz | null>,
  save(quiz: Quiz): Promise<void>,
  saveMany(quizzes: Quiz[]): Promise<void>,
  update(quiz: Quiz): Promise<void>,
  delete(qid: string): Promise<void>,
}
