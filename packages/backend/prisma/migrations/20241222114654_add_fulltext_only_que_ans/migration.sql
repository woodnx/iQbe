-- CreateIndex
CREATE FULLTEXT INDEX `quizzes_que_idx` ON `quizzes`(`que`) WITH PARSER ngram;

-- CreateIndex
CREATE FULLTEXT INDEX `quizzes_ans_idx` ON `quizzes`(`ans`) WITH PARSER ngram;
