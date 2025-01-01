import { ApiError } from 'api';
import { components } from 'api/schema';

import Quiz from '@/domains/Quiz';
import IQuizRepository from '@/domains/Quiz/IQuizRepository';
import QuizService from '@/domains/Quiz/QuizService';
import ITagRepository from '@/domains/Tag/ITagRepository';
import TagService from '@/domains/Tag/TagService';

import ITransactionManager from '../shared/ITransactionManager';

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
    isPublic: boolean,
    uid: string,
    anotherAnswer?: string,
    categoryId?: number,
    wid?: string,
  ): Promise<QuizDTO> {
    const quizService = new QuizService();
    const tagService = new TagService(this.tagRepository);

    const qid = quizService.generateQid();
    const quiz = Quiz.create(
      qid,
      question,
      answer,
      tagLabels,
      uid,
      isPublic ? [] : [ uid ],
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
        );

        await this.quizRepository.save(quiz);

        return {
          qid: quiz.qid,
          question: quiz.question,
          answer: quiz.answer,
          anotherAnswer: quiz.anotherAnswer,
          wid: quiz.wid,
          tagLabels: _quiz.tagLabels,
          categoryId: quiz.categoryId,
          creatorId: quiz.creatorUid,
          isPublic: quiz.isPublic(),
          right: quiz.right,
          total: quiz.total,
          isFavorite: false,
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
    wid?: string,
  ): Promise<QuizDTO> {
    const quiz = await this.quizRepository.findByQid(qid);
    const tagService = new TagService(this.tagRepository);
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
    quiz.editWid(wid || null);

    // タグ付与処理
    const currentTags = quiz.tagLabels;
    quiz.editTags(tagLabels);
    
    const tagsToAdd = tagLabels.filter(tag => !currentTags.includes(tag));
    const tagsToRemove = currentTags.filter(tag => !tagLabels.includes(tag));
    
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
    }
  }

  async deleteQuiz(qid: string): Promise<void> {
    const tagService = new TagService(this.tagRepository);
    const quiz = await this.quizRepository.findByQid(qid);

    if (!quiz) 
      throw new ApiError({
        title: 'NO_QUIZ',
        detail: 'This qid is not available id',
        status: 400,
        type: 'about:blank'
      });

    await this.quizRepository.delete(quiz);
    await tagService.manageTagsToRemove(quiz.tagLabels);
  }
}
