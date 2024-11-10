/*
  Warnings:

  - You are about to drop the column `creator_id` on the `tags` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `tags` DROP FOREIGN KEY `tags_creator_id_fkey`;

-- AlterTable
ALTER TABLE `tags` DROP COLUMN `creator_id`;
