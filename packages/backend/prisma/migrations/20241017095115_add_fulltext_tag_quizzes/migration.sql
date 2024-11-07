-- CreateIndex
CREATE FULLTEXT INDEX `quizzes_que_ans_anoans_idx` ON `quizzes`(`que`, `ans`, `anoans`) WITH PARSER ngram;

-- CreateIndex
CREATE FULLTEXT INDEX `tags_label_description_idx` ON `tags`(`label`, `description`) WITH PARSER ngram;
