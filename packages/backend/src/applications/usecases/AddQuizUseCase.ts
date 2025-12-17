import { components } from "api/schema";
import Quiz from "@/domains/Quiz";
import IQuizRepository from "@/domains/Quiz/IQuizRepository";
import QuizService from "@/domains/Quiz/QuizService";
import ITagRepository from "@/domains/Tag/ITagRepository";
import TagService from "@/domains/Tag/TagService";
import ITransactionManager from "../shared/ITransactionManager";

type QuizDTO =
  components["responses"]["QuizResponse"]["content"]["application/json"];

export type AddQuizUseCaseCommand = {
  question: string;
  answer: string;
  tagLabels: string[];
  uid: string;
  anotherAnswer?: string;
  categoryId?: number;
  wid?: string;
};

export class AddQuizUseCase {
  constructor(
    private transactionManager: ITransactionManager,
    private quizRepository: IQuizRepository,
    private tagRepository: ITagRepository,
  ) {}

  async execute({
    question,
    answer,
    tagLabels,
    uid,
    anotherAnswer,
    categoryId,
    wid,
  }: AddQuizUseCaseCommand): Promise<QuizDTO> {
    const quizService = new QuizService();
    const tagService = new TagService(this.tagRepository);

    const qid = quizService.generateQid();
    const quiz = Quiz.create(
      qid,
      question,
      answer,
      tagLabels,
      uid,
      anotherAnswer,
      wid,
      categoryId,
    );

    await this.transactionManager.begin(async () => {
      await tagService.manageTagsToAdd(tagLabels);
      await this.quizRepository.save(quiz);
    });

    return {
      qid: quiz.qid,
      question: quiz.question,
      answer: quiz.answer,
      anotherAnswer: quiz.anotherAnswer,
      wid: quiz.wid,
      tagLabels: quiz.tagLabels,
      categoryId: quiz.categoryId,
      creatorId: quiz.creatorUid,
      right: quiz.right,
      total: quiz.total,
      isFavorite: false,
      registerdMylist: [],
    };
  }
}
