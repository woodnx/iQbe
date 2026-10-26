import type { QuizResponseDTO as ApiQuizResponseDTO } from "@/types/dto.js";
import Quiz from "@/domains/Quiz/index.js";
import IQuizRepository from "@/domains/Quiz/IQuizRepository.js";
import QuizService from "@/domains/Quiz/QuizService.js";
import { QuizAttachedTags } from "@/domains/QuizAttachedTags/index.js";
import { IQuizAttachedTagsRepository } from "@/domains/QuizAttachedTags/IQuizAttachedTagsRepository.js";
import { QuizAttachedTagsService } from "@/domains/QuizAttachedTags/QuizAttachedTagsService.js";
import ITagRepository from "@/domains/Tag/ITagRepository.js";
import ITransactionManager from "../../shared/ITransactionManager.js";

type QuizDTO = ApiQuizResponseDTO;

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
