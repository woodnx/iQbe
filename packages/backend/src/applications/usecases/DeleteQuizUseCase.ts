import { ApiError } from "api";
import IQuizRepository from "@/domains/Quiz/IQuizRepository";
import ITagRepository from "@/domains/Tag/ITagRepository";
import TagService from "@/domains/Tag/TagService";
import ITransactionManager from "../shared/ITransactionManager";

export type DeleteQuizUseCaseCommand = {
  qid: string;
};

export class DeleteQuizUseCase {
  constructor(
    private transactionManager: ITransactionManager,
    private quizRepository: IQuizRepository,
    private tagRepository: ITagRepository,
  ) {}

  async execute(command: DeleteQuizUseCaseCommand): Promise<void> {
    const tagService = new TagService(this.tagRepository);
    const quiz = await this.quizRepository.findByQid(command.qid);

    if (!quiz)
      throw new ApiError({
        title: "NO_QUIZ",
        detail: "This qid is not available id",
        status: 400,
        type: "about:blank",
      });

    this.transactionManager.begin(async () => {
      await this.quizRepository.delete(quiz);
      await tagService.manageTagsToRemove(quiz.tagLabels);
    });
  }
}
