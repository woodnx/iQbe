-- AlterTable
ALTER TABLE `refresh_tokens` ADD COLUMN `expired` BOOLEAN NOT NULL DEFAULT false;
