import type ITransactionManager from "@/applications/shared/ITransactionManager.js";
import type IQuizBulkRepository from "@/domains/Quiz/IQuizBulkRepository.js";
import { ApiError } from "@/http/ApiError.js";
import type { AddQuizUseCaseCommand } from "./AddQuizUseCase.js";
import { createQuiz } from "./createQuiz.js";

export class AddQuizzesUseCase {
  constructor(
    private transactions: ITransactionManager,
    private repository: IQuizBulkRepository,
  ) {}

  async execute(
    uid: string,
    records: Omit<AddQuizUseCaseCommand, "uid">[],
  ): Promise<void> {
    if (!records.length || records.length > 1000)
      throw new ApiError().invalidParams();
    const prepared = records.map((record) => ({
      quiz: createQuiz({ ...record, uid }),
      tagLabels: [...new Set(record.tagLabels)],
    }));
    await this.transactions.begin(() =>
      this.repository.saveMany(prepared, uid),
    );
  }
}
