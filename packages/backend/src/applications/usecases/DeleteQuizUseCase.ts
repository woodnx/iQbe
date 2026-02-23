import { ApiError } from "api";
import IQuizRepository from "@/domains/Quiz/IQuizRepository";
import { QuizAttachedTags } from "@/domains/QuizAttachedTags";
import { IQuizAttachedTagsRepository } from "@/domains/QuizAttachedTags/IQuizAttachedTagsRepository";
import { QuizAttachedTagsService } from "@/domains/QuizAttachedTags/QuizAttachedTagsService";
import ITagRepository from "@/domains/Tag/ITagRepository";
import ITransactionManager from "../shared/ITransactionManager";

export type DeleteQuizUseCaseCommand = {
  qid: string;
};

export class DeleteQuizUseCase {
  constructor(
    private transactionManager: ITransactionManager,
    private quizRepository: IQuizRepository,
    private tagRepository: ITagRepository,
    private quizAttachedTagsRepository: IQuizAttachedTagsRepository,
  ) {}

  async execute(command: DeleteQuizUseCaseCommand): Promise<void> {
    const quizAttachedTagsService = new QuizAttachedTagsService(
      this.quizAttachedTagsRepository,
      this.tagRepository,
    );
    const quiz = await this.quizRepository.findByQid(command.qid);

    if (!quiz)
      throw new ApiError({
        title: "NO_QUIZ",
        detail: "This qid is not available id",
        status: 400,
        type: "about:blank",
      });

    const assignedTags = QuizAttachedTags.create(quiz.qid, []);

    await this.transactionManager.begin(async () => {
      await this.quizRepository.delete(quiz);
      await quizAttachedTagsService.updateAttachedTags(assignedTags);
    });
  }
}
