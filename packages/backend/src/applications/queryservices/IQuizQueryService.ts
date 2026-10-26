import type {
  QuizDTO as ApiQuizDTO,
  QuizFilter as ApiQuizFilter,
} from "@/types/dto.js";

type QuizDTO = ApiQuizDTO;

export type findOption = ApiQuizFilter & {};
export type countOption = ApiQuizFilter & {};

export default interface IQuizQueryService {
  findMany(uid: string, option?: findOption): Promise<QuizDTO[]>;
  count(uid: string, option?: countOption): Promise<number>;
}
