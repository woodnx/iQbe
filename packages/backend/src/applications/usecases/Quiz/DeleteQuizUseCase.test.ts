import { InMemoryQuizAttachedTagsInfra } from "@/interfaces/infra/InMemory/QuizAttachedTagsInfra.js";
import { InMemoryQuizInfra } from "@/interfaces/infra/InMemory/QuizInfra.js";
import { InMemoryTagInfra } from "@/interfaces/infra/InMemory/TagInfra.js";
import { MockTransactionManager } from "../../shared/MockTransactionManager.js";
import { AddQuizUseCase, AddQuizUseCaseCommand } from "./AddQuizUseCase.js";
import { DeleteQuizUseCase } from "./DeleteQuizUseCase.js";

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

    await expect(
      deleteQuizUseCase.execute({ qid: createdQuiz.qid, uid: "another-user" }),
    ).rejects.toMatchObject({ status: 403 });
    expect(await quizRepository.findByQid(createdQuiz.qid)).not.toBeNull();
    await expect(
      deleteQuizUseCase.execute({ qid: "missing", uid: command.uid }),
    ).rejects.toMatchObject({ status: 404 });

    // クイズの削除実行
    await deleteQuizUseCase.execute({
      qid: createdQuiz.qid,
      uid: command.uid,
    });

    // 削除後のクイズの検証
    const deletedQuiz = await quizRepository.findByQid(createdQuiz.qid);
    expect(deletedQuiz).toBeNull();

    const deletedTag1 = await tagRepository.findByLabel("tag1");
    expect(deletedTag1).toBeNull();
  });
});
