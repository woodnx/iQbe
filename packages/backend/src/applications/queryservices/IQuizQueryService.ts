import { Quiz as QuizDTO } from "api/types";

export type findOption = Partial<{
  page: number,
  maxView: number,
  seed: number,
  keyword: string,
  keywordOption: number,
  wids: string[],
  levelIds: number[],
  since: Date,
  until: Date,
  judgements: number[],
  mid: string,
}>

export default interface IQuizQueryService {
  findMany(uid: string, option?: findOption, path?: string): Promise<QuizDTO[]>
}
