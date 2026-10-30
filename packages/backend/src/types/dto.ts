// Application DTOs are independent of HTTP routing and client type inference.
export interface ErrorSchemaDTO {
  title: string;
  type: string;
  status: number;
  detail: string;
}
export interface SubCategoryDTO {
  id: number;
  name: string;
  description?: string | null;
  parentId: number;
  disabled: boolean;
  from?: string | null;
}
export interface CategoryDTO extends SubCategoryDTO {
  sub?: SubCategoryDTO[] | null;
}
export interface TagDTO {
  label: string;
  created: Date;
  modified: Date;
}
export interface MylistDTO {
  mid: string;
  name: string;
  created: Date;
  total: number;
  corrects: number;
  wrongs: number;
  ignored: number;
  lastPracticedAt?: Date | null;
}
export interface WorkbookDTO {
  wid: string;
  name: string;
  date?: Date | null;
  levelId?: number | null;
  color?: string | null;
  creatorId: string;
  total: number;
  corrects: number;
  wrongs: number;
  ignored: number;
  lastPracticedAt?: Date | null;
}
export interface QuizDTO {
  qid: string;
  question: string;
  answer: string;
  anotherAnswer?: string | null;
  wid?: string | null;
  workbook?: WorkbookDTO | null;
  categoryId?: number | null;
  category?: CategoryDTO[] | null;
  total: number;
  right: number;
  tagLabels?: string[] | null;
  tags?: TagDTO[] | null;
  creatorId: string;
  isFavorite: boolean;
  registerdMylist?: MylistDTO[] | null;
  judgement?: number | null;
}
export interface UserDTO {
  uid: string;
  username: string;
  nickname?: string | null;
  email?: string | null;
  modified: string;
  created: string;
  photoURL?: string | null;
  permission?: string | null;
}
export interface AuthResponseDTO {
  accessToken: string;
  user: UserDTO;
}
export interface AuthResponseWithRefreshTokenDTO extends AuthResponseDTO {
  refreshToken: string;
}
export type WorkbookResponseDTO = WorkbookDTO;
export type WorkbooksResponseDTO = WorkbookDTO[];
export type QuizResponseDTO = QuizDTO;
export interface QuizFilter {
  history?: boolean | null;
  page?: number | null;
  maxView?: number | null;
  seed?: number | null;
  wids?: string | string[] | null;
  keyword?: string | null;
  keywordOption?: number | null;
  crctAnsRatio?: number[] | null;
  since?: number | null;
  until?: number | null;
  judgements?: number | number[] | null;
  mid?: string | null;
  isFavorite?: boolean | null;
  tags?: string | string[] | null;
  tagMatchAll?: boolean | null;
  categories?: number | number[] | null;
}
