import IQuizRepository from "./IQuizRepository";
import Tag from "../Tag";
import ITagRepository from "../Tag/ITagRepository";
import TagService from "../Tag/TagService";

export default class TagAssignmentService {
  constructor(
    private quizRepository: IQuizRepository,
    private tagRepository: ITagRepository,
  ) {}

  async isUnusedTag(tagLabel: string) {
    const quizzesWithTag = await this.quizRepository.findByTagLabel(tagLabel);
    return quizzesWithTag.length === 0;
  }

  async assignTagToQuiz(qid: string, tagLabel: string) {
    const tagService = new TagService(this.tagRepository);

    const [ quiz, exist ] = await Promise.all([
      this.quizRepository.findByQid(qid),
      tagService.existTagByLabel(tagLabel),
    ]);

    if (!quiz)
      throw new Error('No quiz exists for such qid');

    if (exist) {
      await this.tagRepository.save(new Tag(tagLabel))
    }

    const tag = await this.tagRepository.findByLabel(tagLabel);

    if (!tag) {
      throw new Error('No tag exists for such label');
    }

    quiz.addTagLabel(tag.label);

    await this.quizRepository.update(quiz);
  }

  async removeTagToQuiz(qid: string, tagLabel: string) {
    const [ quiz, tag ] = await Promise.all([
      this.quizRepository.findByQid(qid),
      this.tagRepository.findByLabel(tagLabel),
    ]);

    if (!quiz || !tag) {
      throw new Error('No quiz exists for such qid');
    }

    quiz.removeTagLabel(tagLabel);

    await this.quizRepository.update(quiz);
    const isUnused = await this.isUnusedTag(tagLabel);

    if (!isUnused) {
      await this.tagRepository.delete(tagLabel);
    }
  }
}