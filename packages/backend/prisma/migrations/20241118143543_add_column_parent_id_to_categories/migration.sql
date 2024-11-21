-- AlterTable
ALTER TABLE `categories` ADD COLUMN `parent_id` BIGINT NOT NULL DEFAULT -1;
