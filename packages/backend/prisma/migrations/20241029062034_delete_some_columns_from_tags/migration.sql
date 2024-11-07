/*
  Warnings:

  - You are about to drop the column `color` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `tid` on the `tags` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `tags_label_description_idx` ON `tags`;

-- AlterTable
ALTER TABLE `tags` DROP COLUMN `color`,
    DROP COLUMN `description`,
    DROP COLUMN `tid`;

-- CreateIndex
CREATE FULLTEXT INDEX `tags_label_idx` ON `tags`(`label`);
