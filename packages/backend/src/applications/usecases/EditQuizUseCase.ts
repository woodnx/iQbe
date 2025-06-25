import { ApiError } from "api";
import { components } from "api/schema";
import IQuizRepository from "@/domains/Quiz/IQuizRepository";
import ITagRepository from "@/domains/Tag/ITagRepository";
import TagService from "@/domains/Tag/TagService";
import ITransactionManager from "../shared/ITransactionManager";

type QuizDTO =
  components["responses"]["QuizResponse"]["content"]["application/json"];

export interface EditQuizUseCaseCommand {
  qid: string;
  question: string;
  answer: string;
  uid: string;
  tagLabels: string[];
  anotherAnswer?: string;
  categoryId?: number;
  wid?: string;
}

export class EditQuizUseCase {
  constructor(
    private transactionManager: ITransactionManager,
    private quizRepository: IQuizRepository,
    private tagRepository: ITagRepository,
  ) {}

  async execute({
    qid,
    question,
    answer,
    uid,
    tagLabels,
    anotherAnswer,
    categoryId,
    wid,
  }: EditQuizUseCaseCommand): Promise<QuizDTO> {
    const quiz = await this.quizRepository.findByQid(qid);
    const tagService = new TagService(this.tagRepository);
    const editable = quiz?.isEditable(uid);

    if (!quiz)
      throw new ApiError({
        title: "NO_QUIZ",
        detail: "This qid is not available id",
        status: 400,
        type: "about:blank",
      });

    if (!editable)
      throw new ApiError({
        title: "NOT_EDITABLE_QUIZ",
        detail: "This quiz is not able to edit",
        status: 403,
        type: "about:blank",
      });

    quiz.editQuestion(question);
    quiz.editAnswer(answer);
    quiz.editAnotherAnswer(anotherAnswer || null);
    quiz.editCategoryId(categoryId || null);
    quiz.editWid(wid || null);

    // タグ付与処理
    const currentTags = quiz.tagLabels;
    quiz.editTags(tagLabels);

    const tagsToAdd = tagLabels.filter((tag) => !currentTags.includes(tag));
    const tagsToRemove = currentTags.filter((tag) => !tagLabels.includes(tag));

    await this.transactionManager.begin(async () => {
      await tagService.manageTagsToAdd(tagsToAdd);
      await this.quizRepository.update(quiz, tagsToAdd, tagsToRemove);
      await tagService.manageTagsToRemove(tagsToRemove);
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
      isPublic: quiz.isPublic(),
      right: quiz.right,
      total: quiz.total,
      isFavorite: false,
    };
  }
}
