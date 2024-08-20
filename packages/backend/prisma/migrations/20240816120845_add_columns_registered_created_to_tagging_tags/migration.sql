/*
  Warnings:

  - Added the required column `registered` to the `tagging` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created` to the `tags` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tid` to the `tags` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tagging` ADD COLUMN `registered` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `tags` ADD COLUMN `created` DATETIME(0) NOT NULL,
    ADD COLUMN `tid` VARCHAR(256) NOT NULL;
