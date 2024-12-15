import ITagRepository from '@/domains/Tag/ITagRepository';
import { typedAsyncWrapper } from '@/utils';

export default class TagController {
  constructor(
    private tagRepository: ITagRepository,
  ) {}

  get() {
    return typedAsyncWrapper<"/tags", "get">(async (req, res) => {
      const q = req.query?.q;
      const all = !!req.query?.all;

      const tags = await this.tagRepository.search(q || '', all);

      const sendTags = tags.map(tag => ({
        label: tag.label,
        created: tag.created,
        modified: tag.created,
      }));

      res.send(sendTags)
    });
  }
}
