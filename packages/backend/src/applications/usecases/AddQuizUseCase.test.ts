import { InMemoryQuizInfra } from "@/interfaces/infra/InMemory/QuizInfra";
import { InMemoryTagInfra } from "@/interfaces/infra/InMemory/TagInfra";
import { MockTransactionManager } from "../shared/MockTransactionManager";
import { AddQuizUseCase, AddQuizUseCaseCommand } from "./AddQuizUseCase";

describe("AddQuizUseCase", () => {
  it("idが重複しないときクイズが正常に作成できる", async () => {
    const quizRepository = new InMemoryQuizInfra();
    const tagRepository = new InMemoryTagInfra();
    const mockTransactionManager = new MockTransactionManager();
    const addQuizUseCase = new AddQuizUseCase(
      mockTransactionManager,
      quizRepository,
      tagRepository,
    );

    const command: Required<AddQuizUseCaseCommand> = {
      question:
        "Google Chrome、Mozilla Firefox、Internet Explorerなど、インターネット上の情報を閲覧するためのソフトのことを英語で何というでしょう？",
      answer: "ブラウザ",
      tagLabels: [],
      uid: "test-user",
      anotherAnswer: "ウェブブラウザ",
      categoryId: 1,
      wid: "test-wid",
    };

    const createdQuiz = await addQuizUseCase.execute(command);

    const quiz = await quizRepository.findByQid(createdQuiz.qid);
    expect(quiz?.question).toBe(
      "Google Chrome、Mozilla Firefox、Internet Explorerなど、インターネット上の情報を閲覧するためのソフトのことを英語で何というでしょう？",
    );
    expect(quiz?.answer).toBe("ブラウザ");
    expect(quiz?.anotherAnswer).toBe("ウェブブラウザ");
    expect(quiz?.categoryId).toBe(1);
    expect(quiz?.wid).toBe("test-wid");
    expect(quiz?.tagLabels).toEqual([]);
  });
});
