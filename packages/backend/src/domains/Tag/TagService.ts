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

  async manageTag(currentTags: string[], newTags: string[]): Promise<string[]> {
    const tagsToAdd = newTags.filter(tag => !currentTags.includes(tag));
    const tagsToRemove = currentTags.filter(tag => !newTags.includes(tag));

    for (const label of tagsToAdd) {
      const _tag = await this.tagRepository.findByLabel(label);
      const tag = _tag || Tag.create(label);

      tag.incrementTagUsage();
    }

    for (const label of tagsToRemove) {
      const tag = await this.tagRepository.findByLabel(label);

      if (!tag) 
        throw new Error('Not found tag such as label');

      tag.decrementTagUsage();

      if (tag.usageCount == 0) {
        await this.tagRepository.delete(tag.label);
      }
    }

    return newTags;
  }
}
