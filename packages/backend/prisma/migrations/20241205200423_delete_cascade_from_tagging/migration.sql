-- DropForeignKey
ALTER TABLE `tagging` DROP FOREIGN KEY `tagging_ibfk_1`;

-- DropForeignKey
ALTER TABLE `tagging` DROP FOREIGN KEY `tagging_ibfk_2`;

-- AddForeignKey
ALTER TABLE `tagging` ADD CONSTRAINT `tagging_ibfk_1` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tagging` ADD CONSTRAINT `tagging_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
