/*
  Warnings:

  - Added the required column `creator_id` to the `tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modified` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tags` ADD COLUMN `creator_id` BIGINT UNSIGNED NOT NULL,
    ADD COLUMN `modified` DATETIME(0) NOT NULL;

-- AddForeignKey
ALTER TABLE `tags` ADD CONSTRAINT `tags_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
