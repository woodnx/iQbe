import type { ApiContext } from "@/http/context.js";
import { getTags } from "@/http/schemas.js";
import ITagRepository from "@/domains/Tag/ITagRepository.js";

export default class TagController {
  constructor(private tagRepository: ITagRepository) {}

  get() {
    return async (c: ApiContext<typeof getTags>) => {
      const query = c.req.valid("query");
      const q = query?.q;
      const all = !!query?.all;

      const tags = await this.tagRepository.search(q || "", all);

      const sendTags = tags.map((tag) => ({
        label: tag.label,
        created: tag.created,
        modified: tag.created,
      }));

      return c.json(sendTags, 200);
    };
  }
}
