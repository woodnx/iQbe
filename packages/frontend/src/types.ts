import type { QuizQuery as ApiQuizQuery } from "@/utils/api-types";
// Globalなtypeを定義

export type QuizRequestParams = ApiQuizQuery & {};

export type KeywordOption = 1 | 2 | 3;

export interface UserStatus {
  start: string;
  end: string;
  right: number;
  through: number;
  wrong: number;
}

export interface Rank {
  userId: number;
  name: string;
  rank: number;
  count: number;
}

export type { Judgement } from "@/utils/quizFilters";

export interface MylistInformation {
  name: string;
  mid: string;
}

export interface UserData {
  uid: string;
  username: string;
}

export interface Workbook {
  wid: string;
  name: string;
  label: string;
  color: string;
  level_id: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface SubCategory extends Category {
  parent_id: number;
}

export interface SubmitValue {
  question: string;
  answer: string;
  tags: string[];
  category?: number;
  subCategory?: number;
  workbook?: string;
  isPublic?: boolean;
}
