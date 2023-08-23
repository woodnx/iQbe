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
  judgement?: Judgement,
}

export interface QuizRequestParams {
  page?: number,
  perPage?: number,
  seed?: number,
  workbooks?: string[],
  levels?: string[],
  keyword?: string,
  keywordOption?: KeywordOption,
  since?: number,
  until?: number,
  judgements?: Judgement[],
  mylistId?: string,
}

export type KeywordOption = "1" | "2" | "3";

export interface UserStatus {
  start: string,
  end: string,
  right: number,
  through: number,
  wrong: number,
}

export interface Rank {
  userId: number,
  name: string,  
  rank: number,
  count: number,
}

export type Judgement = 0 | 1 | 2;

export interface MylistInformation {
  id: number,
  name: string,
}