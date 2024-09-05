import { components } from 'api/schema';

type QuizDTO = components["schemas"]["Quiz"];

export type findOption = Partial<{
  page: number,
  maxView: number,
  seed: number,
  keyword: string,
  keywordOption: number,
  wids: string | string[],
  levelIds: number[],
  since: Date,
  until: Date,
  judgements: number[],
  mid: string,
}>

export default interface IQuizQueryService {
  findMany(uid: string, option?: findOption, path?: string): Promise<QuizDTO[]>
}
