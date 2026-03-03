import { InMemoryQuizAttachedTagsInfra } from "@/interfaces/infra/InMemory/QuizAttachedTagsInfra";
import { InMemoryQuizInfra } from "@/interfaces/infra/InMemory/QuizInfra";
import { InMemoryTagInfra } from "@/interfaces/infra/InMemory/TagInfra";
import { MockTransactionManager } from "../../shared/MockTransactionManager";
import { AddQuizUseCase } from "./AddQuizUseCase";
import { EditQuizUseCase } from "./EditQuizUseCase";

describe("EditQuizUseCase", () => {
  it("クイズが正常に編集できる", async () => {
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
    const editQuizUseCase = new EditQuizUseCase(
      mockTransactionManager,
      quizRepository,
      tagRepository,
      quizAttachedTagsRepository,
    );

    const createdQuiz = await addQuizUseCase.execute({
      question:
        "Google Chrome、Mozilla Firefox、Internet Explorerなど、インターネット上の情報を閲覧するためのソフトのことを英語で何というでしょう？",
      answer: "ブラウザ",
      tagLabels: ["tag1", "tag2"],
      uid: "test-user",
      anotherAnswer: "ウェブブラウザ",
      categoryId: 1,
      wid: "test-wid",
    });

    // 編集コマンドの作成
    const command = {
      qid: createdQuiz.qid,
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
    const tag1 = await tagRepository.findByLabel("tag1");
    const tag2 = await tagRepository.findByLabel("tag2");
    expect(updatedQuiz.question).toBe("Updated Question");
    expect(updatedQuiz.answer).toBe("Updated Answer");
    expect(updatedQuiz.anotherAnswer).toBe("Updated Another Answer");
    expect(updatedQuiz.categoryId).toBe(2);
    expect(updatedQuiz.wid).toBe("updated-wid");
    expect(updatedQuiz.tagLabels).toEqual(["tag1", "tag3"]);
    expect(tag1?.label).toBe("tag1");
    expect(tag2).toBeNull();
  });
});
