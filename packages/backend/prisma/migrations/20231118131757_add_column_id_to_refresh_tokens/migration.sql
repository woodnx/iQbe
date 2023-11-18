/*
  Warnings:

  - The primary key for the `refresh_tokens` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `id` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY refresh_tokens_user_id_fkey;
ALTER TABLE `refresh_tokens` DROP PRIMARY KEY;
ALTER TABLE `refresh_tokens` 
    ADD COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);
