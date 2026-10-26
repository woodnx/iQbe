import type Quiz from "./index.js";

export interface QuizBulkRecord {
  quiz: Quiz;
  tagLabels: string[];
}
export default interface IQuizBulkRepository {
  saveMany(records: QuizBulkRecord[], uid: string): Promise<void>;
}
