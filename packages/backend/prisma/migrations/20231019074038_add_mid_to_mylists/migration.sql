/*
  Warnings:

  - You are about to drop the column `hash_ids` on the `mylists` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `mylists` DROP COLUMN `hash_ids`,
    ADD COLUMN `mid` VARCHAR(20) NULL;
