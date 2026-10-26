import { ApiError } from "@/http/ApiError.js";
import IQuizRepository from "@/domains/Quiz/IQuizRepository.js";
import { QuizAttachedTags } from "@/domains/QuizAttachedTags/index.js";
import { IQuizAttachedTagsRepository } from "@/domains/QuizAttachedTags/IQuizAttachedTagsRepository.js";
import { QuizAttachedTagsService } from "@/domains/QuizAttachedTags/QuizAttachedTagsService.js";
import ITagRepository from "@/domains/Tag/ITagRepository.js";
import ITransactionManager from "../../shared/ITransactionManager.js";

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
      await quizAttachedTagsService.updateAttachedTags(assignedTags);
      await this.quizRepository.delete(quiz);
    });
  }
}
