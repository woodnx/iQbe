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

      const tags = await this.tagRepository.search(q || '');

      const sendTags = tags.map(tag => ({
        label: tag.label,
        created: format(tag.created),
        modified: format(tag.created),
      }));

      res.send(sendTags)
    });
  }
}
