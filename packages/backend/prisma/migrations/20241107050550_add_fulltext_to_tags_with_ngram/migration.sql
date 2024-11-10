-- CreateIndex
CREATE FULLTEXT INDEX `tags_label_idx` ON `tags`(`label`) WITH PARSER ngram;
