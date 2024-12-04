import Quiz from "@/domains/Quiz";
import { DomainEvent } from ".";

export type QuizDomainEventBody = {
  qid: string,
  question: string,
  answer: string,
  anotherAnswer: string | null,
  wid: string | null,
  tags: string[],
  category: number | null,
  subCategory: number | null,
  creatorId: string,
  isPublic: boolean,
  right: number,
  total: number,
  isFavorite: boolean,
  registerdMylist: string[],
}

export const QUIZ_EVENT_NAME = {
  CREATED: 'QuizManagement.QuizCreated',
  UPDATED: 'QuizManagement.QuizUpdated',
  DELETED: 'QuizManagement.QuizDeleted',
} as const;

export class QuizDomainEventFactory {
  constructor(private quiz: Quiz){}

  public createEvent(
    eventName: (typeof QUIZ_EVENT_NAME)[keyof typeof QUIZ_EVENT_NAME]
  ) {
    return DomainEvent.create(this.entityToEventBody(), eventName);
  }

  private entityToEventBody(): QuizDomainEventBody {
    return {
      qid: this.quiz.qid,
      question: this.quiz.question,
      answer: this.quiz.answer,
      anotherAnswer: this.quiz.anotherAnswer,
      wid: this.quiz.wid,
      tags: this.quiz.tagLabels,
      category: this.quiz.categoryId,
      subCategory: this.quiz.subCategoryId,
      creatorId: this.quiz.creatorUid,
      isPublic: this.quiz.isPublic(),
      right: this.quiz.right,
      total: this.quiz.total,
      isFavorite: false,
      registerdMylist: [],
    };
  }
}