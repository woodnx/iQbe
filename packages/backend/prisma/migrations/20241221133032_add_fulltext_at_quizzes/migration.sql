-- CreateIndex
CREATE FULLTEXT INDEX `quizzes_que_idx` ON `quizzes`(`que`) WITH PARSER ngram;

-- CreateIndex
CREATE FULLTEXT INDEX `quizzes_ans_idx` ON `quizzes`(`ans`) WITH PARSER ngram;

-- CreateIndex
CREATE FULLTEXT INDEX `quizzes_que_ans_idx` ON `quizzes`(`que`, `ans`) WITH PARSER ngram;

-- CreateIndex
CREATE FULLTEXT INDEX `quizzes_que_ans_anoans_idx` ON `quizzes`(`que`, `ans`, `anoans`) WITH PARSER ngram;
