import { components, paths } from "api/schema";

type QuizDTO = components["schemas"]["Quiz"];

export type findOption = paths["/quizzes"]["get"]["parameters"]["query"] & {};
export type countOption =
  paths["/quizzes/size"]["get"]["parameters"]["query"] & {};

export default interface IQuizQueryService {
  findMany(uid: string, option?: findOption): Promise<QuizDTO[]>;
  count(uid: string, option?: countOption): Promise<number>;
}
