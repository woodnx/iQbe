import { components } from "api/schema";
import Quiz from "@/domains/Quiz";
import IQuizRepository from "@/domains/Quiz/IQuizRepository";
import QuizService from "@/domains/Quiz/QuizService";
import { QuizAttachedTags } from "@/domains/QuizAttachedTags";
import { IQuizAttachedTagsRepository } from "@/domains/QuizAttachedTags/IQuizAttachedTagsRepository";
import { QuizAttachedTagsService } from "@/domains/QuizAttachedTags/QuizAttachedTagsService";
import ITagRepository from "@/domains/Tag/ITagRepository";
import ITransactionManager from "../../shared/ITransactionManager";

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
    private quizAttachedTagsRepository: IQuizAttachedTagsRepository,
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
    const quizAttachedTagsService = new QuizAttachedTagsService(
      this.quizAttachedTagsRepository,
      this.tagRepository,
    );

    const qid = quizService.generateQid();
    const quiz = Quiz.create(
      qid,
      question,
      answer,
      uid,
      anotherAnswer,
      wid,
      categoryId,
    );
    const assignedTags = QuizAttachedTags.create(qid, tagLabels);

    await this.transactionManager.begin(async () => {
      await this.quizRepository.save(quiz);
      await quizAttachedTagsService.updateAttachedTags(assignedTags);
    });

    return {
      qid: quiz.qid,
      question: quiz.question,
      answer: quiz.answer,
      anotherAnswer: quiz.anotherAnswer,
      wid: quiz.wid,
      tagLabels: tagLabels,
      categoryId: quiz.categoryId,
      creatorId: quiz.creatorUid,
      right: quiz.right,
      total: quiz.total,
      isFavorite: false,
      registerdMylist: [],
    };
  }
}
