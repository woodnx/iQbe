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
      question: "",
      answer: "",
      tagLabels: [],
      uid: "test-user",
      anotherAnswer: "test-answer",
      categoryId: 1,
      wid: "test-wid",
    };

    const createdQuiz = await addQuizUseCase.execute(command);

    const quiz = await quizRepository.findByQid(createdQuiz.qid);
    expect(quiz).toEqual(createdQuiz);
  });
});
