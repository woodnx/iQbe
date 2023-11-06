-- DropForeignKey
ALTER TABLE `mylists_quizzes` DROP FOREIGN KEY `mylists_quizzes_ibfk_1`;

-- DropForeignKey
ALTER TABLE `mylists_quizzes` DROP FOREIGN KEY `mylists_quizzes_ibfk_2`;

-- AddForeignKey
ALTER TABLE `mylists_quizzes` ADD CONSTRAINT `mylists_quizzes_ibfk_1` FOREIGN KEY (`mylist_id`) REFERENCES `mylists`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mylists_quizzes` ADD CONSTRAINT `mylists_quizzes_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
