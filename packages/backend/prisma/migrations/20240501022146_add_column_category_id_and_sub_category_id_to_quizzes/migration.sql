-- AlterTable
ALTER TABLE `quizzes` ADD COLUMN `category_id` BIGINT NULL,
    ADD COLUMN `sub_category_id` BIGINT NULL;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `quizzes` ADD CONSTRAINT `quizzes_sub_category_id_fkey` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
