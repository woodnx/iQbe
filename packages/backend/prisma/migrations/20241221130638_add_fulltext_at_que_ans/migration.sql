-- CreateIndex
CREATE FULLTEXT INDEX `quizzes_que_idx` ON `quizzes`(`que`);

-- CreateIndex
CREATE FULLTEXT INDEX `quizzes_que_ans_idx` ON `quizzes`(`que`, `ans`);
