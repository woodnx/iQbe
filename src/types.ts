// Globalなtypeを定義

export interface Quiz {
  id: number,
  question: string,
  answer: string,
  workbook: string,
  level: string,
  date: string,
  total: number,
  right: number,
  isFavorite: boolean,
  registerdMylist: number[],
  size: number,
}

export interface QuizRequestParams {
  page?: number,
  perPage?: number,
  seed?: number,
  workbooks?: string[],
  levels?: string[],
  keyword?: string,
  keywordOption?: KeywordOption,
  since?: string,
  until?: string,
  judgement?: number,
}

export type KeywordOption = "1" | "2" | "3";

export interface UserStatus {
  start: string,
  end: string,
  right: number,
  through: number,
  wrong: number,
}