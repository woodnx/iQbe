/*
  Warnings:

  - Made the column `creator_id` on table `workbooks` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `workbooks` DROP FOREIGN KEY `workbooks_creator_id_fkey`;

-- AlterTable
ALTER TABLE `workbooks` MODIFY `creator_id` BIGINT UNSIGNED NOT NULL;

-- AddForeignKey
ALTER TABLE `workbooks` ADD CONSTRAINT `workbooks_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
