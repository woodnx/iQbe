-- AlterTable
ALTER TABLE `quizzes` ADD COLUMN `creator_id` BIGINT UNSIGNED NULL;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
