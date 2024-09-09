import TaggedQuiz from ".";
import IQuizRepository from "../Quiz/IQuizRepository";
import ITagRepository from "../Tag/ITagRepository";
import ITaggedQuizRepository from "./ITaggedQuizRepository";

export default class TaggedQuizService {
  constructor(
    private tagRepository: ITagRepository,
    private quizRepository: IQuizRepository,
    private taggedQuizRepository: ITaggedQuizRepository,
  ) {}

  async add(tid: string, qid: string) {
    const [ tag, quiz ] = await Promise.all([
      this.tagRepository.findByTid(tid),
      this.quizRepository.findByQid(qid),
    ]);

    const now = new Date();

    if (!tag || !quiz) {
      throw new Error('Mylist or quiz not found');
    }

    const taggedQuiz = new TaggedQuiz(tag, quiz, now);
    return this.taggedQuizRepository.insert(taggedQuiz);
  }

  async delete(tid: string, qid: string) {
    const [ tag, quiz ] = await Promise.all([
      this.tagRepository.findByTid(tid),
      this.quizRepository.findByQid(qid),
    ]);

    if (!tag || !quiz) {
      throw new Error('Mylist or quiz not found');
    }

    const now = new Date();

    const registeredQuiz = new TaggedQuiz(tag, quiz, now);
    return this.taggedQuizRepository.delete(registeredQuiz);
  }
}
