import Quiz from "@/domains/Quiz/index.js";
import { quizContentSchema } from "@/domains/Quiz/input.js";
import QuizService from "@/domains/Quiz/QuizService.js";
import { ApiError } from "@/http/ApiError.js";
import type { AddQuizUseCaseCommand } from "./AddQuizUseCase.js";

export function createQuiz(input: AddQuizUseCaseCommand): Quiz {
  const result = quizContentSchema.safeParse({
    ...input,
    tags: input.tagLabels,
    category: input.categoryId,
  });
  if (!result.success) throw new ApiError().invalidParams(result.error.message);
  return Quiz.create(
    new QuizService().generateQid(),
    input.question,
    input.answer,
    input.uid,
    input.anotherAnswer,
    input.wid,
    input.categoryId,
  );
}
