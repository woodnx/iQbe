import IQuizRepository from "@/domains/Quiz/IQuizRepository";
import QuizService from "@/domains/Quiz/QuizService";
import { components } from "api/schema";
import ITransactionManager from "../shared/ITransactionManager";
import Quiz from "@/domains/Quiz";
import { ApiError } from "api";
import ITagRepository from "@/domains/Tag/ITagRepository";
import TagAssignmentService from "@/domains/Quiz/TagAssignmentSerice";

type QuizDTO = components["responses"]["QuizResponse"]["content"]["application/json"];

export default class QuizUseCase {
  constructor(
    private transactionManager: ITransactionManager,
    private quizRepository: IQuizRepository,
    private tagRepository: ITagRepository,
  ) {}

  async addQuiz(
    question: string,
    answer: string,
    tagLabels: string[],
    limitedUser: string[],
    uid: string,
    anotherAnswer?: string,
    categoryId?: number,
    subCategoryId?: number,
    wid?: string,
  ): Promise<QuizDTO> {
    const quizService = new QuizService();
    const tagAssignmentService = new TagAssignmentService(this.quizRepository, this.tagRepository);

    const qid = quizService.generateQid();
    const quiz = Quiz.create(
      qid,
      question,
      answer,
      tagLabels,
      uid,
      limitedUser,
      anotherAnswer,
      wid,
      categoryId,
      subCategoryId,
    );

    await this.transactionManager.begin(async () => {
      for (const tag of tagLabels) {
        tagAssignmentService.assignTagToQuiz(qid, tag);
      }

      await this.quizRepository.save(quiz);
    });

    return {
      qid: quiz.qid,
      question: quiz.question,
      answer: quiz.answer,
      anotherAnswer: quiz.anotherAnswer,
      wid: quiz.wid,
      tags: quiz.tagLabels,
      category: quiz.categoryId,
      subCategory: quiz.subCategoryId,
      creatorId: quiz.creatorUid,
      isPublic: quiz.isPublic(),
      right: quiz.right,
      total: quiz.total,
      isFavorite: false,
      registerdMylist: [],
    }
  }

  async addQuizzes(
    quizzes: {
      question: string,
      answer: string,
      limitedUser: string[],
      tagLabels: string[],
      uid: string,
      anotherAnswer?: string,
      categoryId?: number,
      subCategoryId?: number,
      wid?: string,
    }[],
  ): Promise<QuizDTO[]> {
    const quizService = new QuizService();

    const dto = await this.transactionManager.begin(async () => {
      return Promise.all(quizzes.map(async (_quiz) => {
        const qid = quizService.generateQid();

        const quiz = Quiz.create(
          qid,
          _quiz.question,
          _quiz.answer,
          _quiz.tagLabels,
          _quiz.uid,
          _quiz.limitedUser,
          _quiz.anotherAnswer,
          _quiz.wid,
          _quiz.categoryId,
          _quiz.subCategoryId,
        );

        await this.quizRepository.save(quiz);

        return {
          qid: quiz.qid,
          question: quiz.question,
          answer: quiz.answer,
          anotherAnswer: quiz.anotherAnswer,
          wid: quiz.wid,
          tags: _quiz.tagLabels,
          category: quiz.categoryId,
          subCategory: quiz.subCategoryId,
          creatorId: quiz.creatorUid,
          isPublic: quiz.isPublic(),
          right: quiz.right,
          total: quiz.total,
          isFavorite: false,
          registerdMylist: [],
        }
      }))
    });

    return dto || []; 
  }

  async editQuiz(
    qid: string,
    question: string,
    answer: string,
    uid: string,
    tagLabels: string[],
    anotherAnswer?: string,
    categoryId?: number,
    subCategoryId?: number,
    wid?: string,
  ): Promise<QuizDTO> {
    const tagAssignmentService = new TagAssignmentService(this.quizRepository, this.tagRepository);
    const quiz = await this.quizRepository.findByQid(qid);
    const editable = quiz?.isEditable(uid);

    if (!quiz) 
      throw new ApiError({
        title: 'NO_QUIZ',
        detail: 'This qid is not available id',
        status: 400,
        type: 'about:blank'
      });

    if (!editable) 
      throw new ApiError({
        title: 'NOT_EDITABLE_QUIZ',
        detail: 'This quiz is not able to edit',
        status: 403,
        type: 'about:blank'
      });

    quiz.editQuestion(question);
    quiz.editAnswer(answer);
    quiz.editAnotherAnswer(anotherAnswer || null);
    quiz.editCategoryId(categoryId || null);
    quiz.editSubCategoryId(subCategoryId || null);
    quiz.editWid(wid || null);

    // タグ付与処理
    const oldTagLabels = quiz.tagLabels;
    quiz.editTags(tagLabels);
    
    await this.transactionManager.begin(async () => {
      const addedTags = tagLabels.filter(tag => !oldTagLabels.includes(tag));
      const removedTags = oldTagLabels.filter(tag => !tagLabels.includes(tag));

      for (const tag of addedTags) {
        await tagAssignmentService.assignTagToQuiz(qid, tag);
      }

      for (const tag of removedTags) {
        await tagAssignmentService.removeTagFromQuiz(qid, tag);
      }

      await this.quizRepository.save(quiz);
    });
    
    return {
      qid: quiz.qid,
      question: quiz.question,
      answer: quiz.answer,
      anotherAnswer: quiz.anotherAnswer,
      wid: quiz.wid,
      tags: quiz.tagLabels,
      category: quiz.categoryId,
      subCategory: quiz.subCategoryId,
      creatorId: quiz.creatorUid,
      isPublic: quiz.isPublic(),
      right: quiz.right,
      total: quiz.total,
      isFavorite: false,
      registerdMylist: [],
    }
  }

  async deleteQuiz(qid: string): Promise<void> {
    await this.quizRepository.delete(qid);
  }
}
