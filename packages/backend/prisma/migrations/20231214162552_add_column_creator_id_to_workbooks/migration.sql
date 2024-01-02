-- AlterTable
ALTER TABLE `workbooks` ADD COLUMN `creator_id` BIGINT UNSIGNED NULL;

-- AddForeignKey
ALTER TABLE `workbooks` ADD CONSTRAINT `workbooks_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
