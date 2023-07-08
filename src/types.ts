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
  page: number,
  maxView: number,
  seed?: number,
  workbook?: string[],
  level?: string[],
  keyword?: string,
  keywordOption?: string,
  since?: string,
  until?: string,
  judgement?: number,
}