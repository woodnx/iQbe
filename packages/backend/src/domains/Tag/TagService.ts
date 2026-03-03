import Tag from ".";
import ITagRepository from "./ITagRepository";

export type TagDiff = {
  tagsToAdd: string[];
  tagsToRemove: string[];
};

export default class TagService {
  constructor(private tagRepository: ITagRepository) {}

  diffTags(currentTags: string[], updateTags: string[]): TagDiff {
    const currentTagSet = new Set(currentTags);
    const updateTagSet = new Set(updateTags);

    return {
      tagsToAdd: Array.from(updateTagSet).filter(
        (tag) => !currentTagSet.has(tag),
      ),
      tagsToRemove: Array.from(currentTagSet).filter(
        (tag) => !updateTagSet.has(tag),
      ),
    };
  }

  async existTagByLabel(label: string): Promise<boolean> {
    const tag = await this.tagRepository.findByLabel(label);

    return !!tag;
  }
}
