import { QuizAttachedTags } from ".";

export interface IQuizAttachedTagsRepository {
  findByQid(qid: string): Promise<QuizAttachedTags>;
  save(quizAssignedTags: QuizAttachedTags): Promise<void>;
  delete(quizAssignedTags: QuizAttachedTags): Promise<void>;
}
