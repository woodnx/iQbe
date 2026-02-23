import { QuizAttachedTags } from "@/domains/QuizAttachedTags";
import { IQuizAttachedTagsRepository } from "@/domains/QuizAttachedTags/IQuizAttachedTagsRepository";

export class InMemoryQuizAttachedTagsInfra
  implements IQuizAttachedTagsRepository
{
  public DB: {
    [qid: string]: QuizAttachedTags;
  } = {};

  async findByQid(qid: string): Promise<QuizAttachedTags> {
    const attachedTags = Object.entries(this.DB).find(([id]) => {
      return qid === id;
    });

    if (!attachedTags) {
      const q = QuizAttachedTags.create(qid, []);
      await this.save(q);
      return q;
    }

    return attachedTags[1];
  }

  async save(quizAssignedTags: QuizAttachedTags) {
    this.DB[quizAssignedTags.qid] = quizAssignedTags;
  }

  async delete(quizAssignedTags: QuizAttachedTags) {
    delete this.DB[quizAssignedTags.qid];
  }
}
