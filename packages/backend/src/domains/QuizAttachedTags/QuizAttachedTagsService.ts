import Tag from "../Tag";
import ITagRepository from "../Tag/ITagRepository";
import { QuizAttachedTags } from ".";
import { IQuizAttachedTagsRepository } from "./IQuizAttachedTagsRepository";

export class QuizAttachedTagsService {
  constructor(
    private quizAttachedTagsRepository: IQuizAttachedTagsRepository,
    private tagRepository: ITagRepository,
  ) {}

  async updateAttachedTags(assignedTags: QuizAttachedTags) {
    const qid = assignedTags.qid;
    const currentTags = await this.quizAttachedTagsRepository
      .findByQid(qid)
      .then((v) => new Set(v.tagLabels));
    const updateTags = new Set(assignedTags.tagLabels);

    const tagsToAttach = Array.from(updateTags).filter(
      (tag) => !currentTags.has(tag),
    );
    const tagsToDetach = Array.from(currentTags).filter(
      (tag) => !updateTags.has(tag),
    );
    if (tagsToAttach.length > 0)
      await this.attachTags(QuizAttachedTags.create(qid, tagsToAttach));
    if (tagsToDetach.length > 0)
      await this.detachTags(QuizAttachedTags.create(qid, tagsToDetach));
  }

  private async incrementUsage(label: string): Promise<void> {
    const foundTag = await this.tagRepository.findByLabel(label);
    const tag = foundTag || Tag.create(label);

    tag.incrementTagUsage();
    await this.tagRepository.save(tag);
  }

  private async decrementUsage(label: string): Promise<void> {
    const tag = await this.tagRepository.findByLabel(label);
    if (!tag) return;

    tag.decrementTagUsage();

    if (tag.usageCount === 0) {
      await this.tagRepository.delete(tag.label);
    }
  }

  private async attachTags(tags: QuizAttachedTags): Promise<void> {
    for (const label of tags.tagLabels) {
      await this.incrementUsage(label);
    }

    await this.quizAttachedTagsRepository.save(tags);
  }

  private async detachTags(tags: QuizAttachedTags): Promise<void> {
    await this.quizAttachedTagsRepository.delete(tags);

    for (const label of tags.tagLabels) {
      await this.decrementUsage(label);
    }
  }
}
