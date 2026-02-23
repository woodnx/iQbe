import { InMemoryQuizAttachedTagsInfra } from "@/interfaces/infra/InMemory/QuizAttachedTagsInfra";
import { InMemoryQuizInfra } from "@/interfaces/infra/InMemory/QuizInfra";
import { InMemoryTagInfra } from "@/interfaces/infra/InMemory/TagInfra";
import { MockTransactionManager } from "../shared/MockTransactionManager";
import { AddQuizUseCase, AddQuizUseCaseCommand } from "./AddQuizUseCase";
import { DeleteQuizUseCase } from "./DeleteQuizUseCase";

describe("DeleteQuizUseCase", () => {
  it("クイズが正常に削除できる", async () => {
    const quizRepository = new InMemoryQuizInfra();
    const tagRepository = new InMemoryTagInfra();
    const quizAttachedTagsRepository = new InMemoryQuizAttachedTagsInfra();
    const mockTransactionManager = new MockTransactionManager();
    const addQuizUseCase = new AddQuizUseCase(
      mockTransactionManager,
      quizRepository,
      tagRepository,
      quizAttachedTagsRepository,
    );
    const deleteQuizUseCase = new DeleteQuizUseCase(
      mockTransactionManager,
      quizRepository,
      tagRepository,
      quizAttachedTagsRepository,
    );

    // 事前にクイズを追加
    const command: Required<AddQuizUseCaseCommand> = {
      question:
        "Google Chrome、Mozilla Firefox、Internet Explorerなど、インターネット上の情報を閲覧するためのソフトのことを英語で何というでしょう？",
      answer: "ブラウザ",
      tagLabels: ["tag1"],
      uid: "test-user",
      anotherAnswer: "ウェブブラウザ",
      categoryId: 1,
      wid: "test-wid",
    };
    const createdQuiz = await addQuizUseCase.execute(command);

    // クイズの削除実行
    await deleteQuizUseCase.execute({
      qid: createdQuiz.qid,
    });

    // 削除後のクイズの検証
    const deletedQuiz = await quizRepository.findByQid(createdQuiz.qid);
    expect(deletedQuiz).toBeNull();

    const deletedTag1 = await tagRepository.findByLabel("tag1");
    expect(deletedTag1).toBeNull();
  });
});
