// Globalなtypeを定義

export interface Quiz {
  id: number,
  question: string,
  answer: string,
  workbook: string,
  wid: string,
  level: string,
  date: string,
  total: number,
  right: number,
  isFavorite: boolean,
  registerdMylist: string[],
  size: number,
  judgement?: Judgement,
  creatorId: string,
  category?: number,
  subCategory?: number,
  isPublic?: boolean,
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
  name: string,
  mid: string,
}

export interface UserData {
  uid: string,
  username: string,
}

export interface Workbook {
  wid: string,
  name: string,
  label: string,
  color: string,
  level_id: number,
}

export interface Category {
  id: number,
  name: string,
  description: string,
}

export interface SubCategory extends Category {
  parent_id: number,
}

export interface SubmitValue {
  question: string,
  answer: string,
  category?: number,
  subCategory?: number,
  workbook?: string,
  isPublic?: boolean,
}