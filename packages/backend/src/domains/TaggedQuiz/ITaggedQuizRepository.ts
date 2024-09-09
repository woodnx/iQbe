import TaggedQuiz from ".";

export default interface ITaggedQuizRepository {
  insert(taggedQuiz: TaggedQuiz): Promise<void>,
  delete(taggedQuiz: TaggedQuiz): Promise<void>,
}
