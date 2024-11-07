import TaggedQuiz from ".";

export default interface ITaggedQuizRepository {
  findByQid(qid: string): Promise<TaggedQuiz[]>,
  count(taggedQuiz: TaggedQuiz): Promise<number>,
  insert(taggedQuiz: TaggedQuiz): Promise<void>,
  delete(taggedQuiz: TaggedQuiz): Promise<void>,
}
