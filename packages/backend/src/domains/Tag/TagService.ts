import ITagRepository from "./ITagRepository";

export default class TagService {
  constructor(
    private tagRepository: ITagRepository,
  ) {}

  async existTagByLabel(label: string): Promise<boolean> {
    const tag = await this.tagRepository.findByLabel(label);

    return !!tag;
  }
}
