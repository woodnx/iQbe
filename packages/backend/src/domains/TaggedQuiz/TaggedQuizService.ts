import TaggedQuiz from ".";
import IQuizRepository from "../Quiz/IQuizRepository";
import Tag from "../Tag";
import ITagRepository from "../Tag/ITagRepository";
import TagService from "../Tag/TagService";
import ITaggedQuizRepository from "./ITaggedQuizRepository";

export default class TaggedQuizService {
  constructor(
    private tagRepository: ITagRepository,
    private quizRepository: IQuizRepository,
    private taggedQuizRepository: ITaggedQuizRepository,
  ) {}

  async add(label: string, qid: string) {
    const tagService = new TagService(this.tagRepository);

    const [ exist, quiz ] = await Promise.all([
      tagService.existTagByLabel(label),
      this.quizRepository.findByQid(qid),
    ]);

    if (!quiz) {
      throw new Error('No quiz exists for such qid');
    }

    if (exist) {
      await this.tagRepository.save(new Tag(label))
    }

    const tag = await this.tagRepository.findByLabel(label);

    if (!tag) {
      throw new Error('No tag exists for such label');
    }

    const taggedQuiz = new TaggedQuiz(qid, tag);
    return this.taggedQuizRepository.insert(taggedQuiz);
  }

  async delete(label: string, qid: string) {
    const tagService = new TagService(this.tagRepository);

    const [ tag, quiz ] = await Promise.all([
      this.tagRepository.findByLabel(label),
      this.quizRepository.findByQid(qid),
    ]);

    if (!tag || !quiz) {
      throw new Error('No quiz exists for such qid');
    }

    const registeredQuiz = new TaggedQuiz(qid, tag);
    this.taggedQuizRepository.delete(registeredQuiz);

    const exist = await tagService.existTagByLabel(label);

    if (!exist) {
      this.tagRepository.delete(label);
    }
  }
}
