import Quiz from "@/domains/Quiz/index.js";
import IQuizRepository from "@/domains/Quiz/IQuizRepository.js";

export class InMemoryQuizInfra implements IQuizRepository {
  public DB: {
    [qid: string]: Quiz;
  } = {};

  async findByQid(qid: string): Promise<Quiz | null> {
    const quiz = Object.entries(this.DB).find(([id]) => {
      return qid === id;
    });

    return quiz ? quiz[1] : null;
  }

  async save(quiz: Quiz) {
    this.DB[quiz.qid] = quiz;
  }

  async update(quiz: Quiz) {
    this.DB[quiz.qid] = quiz;
  }

  async delete(quiz: Quiz) {
    delete this.DB[quiz.qid];
  }
}
