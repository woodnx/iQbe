import Quiz from "@/domains/Quiz";
import { InMemoryQuizInfra } from "@/interfaces/infra/InMemory/QuizInfra";
import { InMemoryTagInfra } from "@/interfaces/infra/InMemory/TagInfra";
import { MockTransactionManager } from "../shared/MockTransactionManager";
import { EditQuizUseCase } from "./EditQuizUseCase";

describe("EditQuizUseCase", () => {
  it("クイズが正常に編集できる", async () => {
    const quizRepository = new InMemoryQuizInfra();
    const tagRepository = new InMemoryTagInfra();
    const mockTransactionManager = new MockTransactionManager();
    const editQuizUseCase = new EditQuizUseCase(
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
        [],
        "Initial Another Answer",
        "test-wid",
        1,
      ),
    );

    // 編集コマンドの作成
    const command = {
      qid: "test-quiz",
      question: "Updated Question",
      answer: "Updated Answer",
      uid: "test-user",
      tagLabels: ["tag1", "tag3"], // タグを更新
      anotherAnswer: "Updated Another Answer",
      categoryId: 2, // カテゴリを更新
      wid: "updated-wid", // widを更新
    };

    // クイズの編集実行
    const updatedQuiz = await editQuizUseCase.execute(command);

    // 編集後のクイズの検証
    expect(updatedQuiz.question).toBe("Updated Question");
    expect(updatedQuiz.answer).toBe("Updated Answer");
    expect(updatedQuiz.anotherAnswer).toBe("Updated Another Answer");
    expect(updatedQuiz.categoryId).toBe(2);
    expect(updatedQuiz.wid).toBe("updated-wid");
    expect(updatedQuiz.tagLabels).toEqual(["tag1", "tag3"]);
  });
});
