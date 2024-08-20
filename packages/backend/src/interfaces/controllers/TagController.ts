import Tag from "@/domains/Tag";
import ITagRepository from "@/domains/Tag/ITagRepository";
import TagService from "@/domains/Tag/TagService";
import dayjs, { format } from "@/plugins/day";
import { typedAsyncWrapper } from "@/utils";
import { ApiError } from "api";

export default class TagController {
  constructor(
    private tagService: TagService,
    private tagRepository: ITagRepository,
  ) {}

  get() {
    return typedAsyncWrapper<"/tags", "get">(async (req, res) => {
      const uid = req.uid;

      const tags = await this.tagRepository.findOwn(uid);

      const sendTags = tags.map(tag => ({
        tid: tag.tid,
        label: tag.label,
        color: tag.color,
        created: format(tag.created),
        modified: format(tag.modified),
        creatorUid: tag.creatorUid,
      }));

      res.send(sendTags)
    });
  }

  post() {
    return typedAsyncWrapper<"/tags", "post">(async (req, res) => {
      const label = req.body.label;
      const color = req.body.color;
      const uid = req.uid;

      const tid = this.tagService.generateTid();
      const now = dayjs().toDate();

      const tag = new Tag(
        tid,
        label,
        color || null,
        now,
        now,
        uid,
      );

      await this.tagRepository.save(tag);

      res.send({
        tid: tag.tid,
        label: tag.label,
        color: tag.color,
        created: format(tag.created),
        modified: format(tag.modified),
        creatorUid: tag.creatorUid,
      });
    });
  }

  put() {
    return typedAsyncWrapper<"/tags", "put">(async (req, res) => {
      const tid = req.body.tid;
      const label = req.body.label;
      const color = req.body.color || null;

      const tag = await this.tagRepository.findByTid(tid);
      
      if (!tag) throw new ApiError({
        title: "No Tag such as tid",
        detail: "The tag with the corresponding tid does not exist.",
        type: "about:blank",
        status: 400
      });

      tag.editLabel(label);
      tag.editColor(color);

      await this.tagRepository.update(tag);

      res.send({
        tid: tag.tid,
        label: tag.label,
        color: tag.color,
        created: format(tag.created),
        modified: format(tag.modified),
        creatorUid: tag.creatorUid,
      });
    });
  }
  
  delete() {
    return typedAsyncWrapper<"/tags", "delete">(async (req, res) => {
      const tid = req.body.tid;

      await this.tagRepository.delete(tid);

      res.status(204);
    })
  }
}
