import Quiz from "@/domains/Quiz";
import IQuizRepository from "@/domains/Quiz/IQuizRepository";

export class InMemoryQuizInfra implements IQuizRepository {
  public DB: {
    [qid: string]: Quiz;
  } = {};

  async findByQid(qid: string): Promise<Quiz | null> {
    const book = Object.entries(this.DB).find(([id]) => {
      return qid === id;
    });

    return book ? book[1] : null;
  }

  async findByTagLabel(tagLabel: string): Promise<Quiz[]> {
    return Object.values(this.DB).filter((quiz) =>
      quiz.tagLabels.includes(tagLabel),
    );
  }

  async save(quiz: Quiz) {
    this.DB[quiz.qid] = quiz;
  }

  async update(quiz: Quiz, tagsToAdd: string[], tagsToRemove: string[]) {
    this.DB[quiz.qid] = quiz;
  }

  async delete(quiz: Quiz) {
    delete this.DB[quiz.qid];
  }
}
