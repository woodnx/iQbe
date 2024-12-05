import { privateDecrypt } from "crypto";
import Tag from ".";
import ITagRepository from "./ITagRepository";

export default class TagService {
  constructor(
    private tagRepository: ITagRepository,
  ) {}

  async existTagByLabel(label: string): Promise<boolean> {
    const tag = await this.tagRepository.findByLabel(label);

    return !!tag;
  }

  async manageTagsToAdd(tagsToAdd: string[]): Promise<string[]> {
    for (const label of tagsToAdd) {
      const _tag = await this.tagRepository.findByLabel(label);
      const tag = _tag || Tag.create(label); // Tagが存在しなかったら新規作成

      tag.incrementTagUsage();
      await this.tagRepository.save(tag);
    }

    return tagsToAdd;
  }

  async manageTagsToRemove(tagsToRemove: string[]): Promise<string[]> {
    for (const label of tagsToRemove) {
      const tag = await this.tagRepository.findByLabel(label);

      if (!tag) 
        throw new Error('Not found tag such as label');

      tag.decrementTagUsage();

      if (tag.usageCount == 0) {
        await this.tagRepository.delete(tag.label);
      }
    }

    return tagsToRemove;
  }
}
