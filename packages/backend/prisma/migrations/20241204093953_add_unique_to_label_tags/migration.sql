/*
  Warnings:

  - A unique constraint covering the columns `[label]` on the table `tags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `tags_label_key` ON `tags`(`label`);
