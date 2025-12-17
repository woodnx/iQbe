import Quiz from "@/domains/Quiz";
import { InMemoryQuizInfra } from "@/interfaces/infra/InMemory/QuizInfra";
import { InMemoryTagInfra } from "@/interfaces/infra/InMemory/TagInfra";
import { MockTransactionManager } from "../shared/MockTransactionManager";
import { DeleteQuizUseCase } from "./DeleteQuizUseCase";

describe("DeleteQuizUseCase", () => {
  it("クイズが正常に削除できる", async () => {
    const quizRepository = new InMemoryQuizInfra();
    const tagRepository = new InMemoryTagInfra();
    const mockTransactionManager = new MockTransactionManager();
    const deleteQuizUseCase = new DeleteQuizUseCase(
      mockTransactionManager,
      quizRepository,
      tagRepository,
    );

    // 事前にクイズを追加
    await quizRepository.save(
      Quiz.create(
        "test-quiz",
        "Initial Question",
        "Initial Answer",
        ["tag1", "tag2"],
        "test-user",
        "Initial Another Answer",
        "test-wid",
        1,
      ),
    );

    // クイズの削除実行
    await deleteQuizUseCase.execute({
      qid: "test-quiz",
    });

    // 削除後のクイズの検証
    const deletedQuiz = await quizRepository.findByQid("test-quiz");
    expect(deletedQuiz).toBeNull();
  });
});
