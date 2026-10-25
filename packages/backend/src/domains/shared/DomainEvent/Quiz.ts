import Quiz from "@/domains/Quiz/index.js";
import { QuizAttachedTags } from "@/domains/QuizAttachedTags/index.js";
import { DomainEvent } from "./index.js";

export type QuizDomainEventBody = {
  qid: string;
  question: string;
  answer: string;
  anotherAnswer: string | null;
  wid: string | null;
  tags: string[];
  category: number | null;
  creatorId: string;
  right: number;
  total: number;
  isFavorite: boolean;
  registerdMylist: string[];
};

export const QUIZ_EVENT_NAME = {
  CREATED: "QuizManagement.QuizCreated",
  UPDATED: "QuizManagement.QuizUpdated",
  DELETED: "QuizManagement.QuizDeleted",
} as const;

export class QuizDomainEventFactory {
  constructor(
    private quiz: Quiz,
    private attachedTags: QuizAttachedTags,
  ) {}

  public createEvent(
    eventName: (typeof QUIZ_EVENT_NAME)[keyof typeof QUIZ_EVENT_NAME],
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
      tags: this.attachedTags.tagLabels,
      category: this.quiz.categoryId,
      creatorId: this.quiz.creatorUid,
      right: this.quiz.right,
      total: this.quiz.total,
      isFavorite: false,
      registerdMylist: [],
    };
  }
}
