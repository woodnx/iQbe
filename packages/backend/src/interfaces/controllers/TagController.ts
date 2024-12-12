import ITagRepository from '@/domains/Tag/ITagRepository';
import { format } from '@/plugins/day';
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
        created: format(tag.created),
        modified: format(tag.created),
      }));

      res.send(sendTags)
    });
  }
}
