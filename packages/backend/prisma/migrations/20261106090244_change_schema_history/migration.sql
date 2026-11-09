/*
  Warnings:

  - The primary key for the `histories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[user_id,client_attempt_id]` on the table `histories` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id` to the `histories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `histories` DROP PRIMARY KEY,
    ADD COLUMN `client_attempt_id` VARCHAR(36) NULL,
    ADD COLUMN `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- CreateIndex
CREATE INDEX `histories_user_id_quiz_id_practiced_idx` ON `histories`(`user_id`, `quiz_id`, `practiced`);

-- CreateIndex
CREATE UNIQUE INDEX `histories_user_id_client_attempt_id_key` ON `histories`(`user_id`, `client_attempt_id`);
