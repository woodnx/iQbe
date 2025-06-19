import Quiz from ".";

export default interface IQuizRepository {
  findByQid(qid: string): Promise<Quiz | null>;
  findByTagLabel(tagLabel: string): Promise<Quiz[]>;
  save(quiz: Quiz): Promise<void>;
  update(
    quiz: Quiz,
    tagsToAdd: string[],
    tagsToRemove: string[],
  ): Promise<void>;
  delete(quiz: Quiz): Promise<void>;
}
