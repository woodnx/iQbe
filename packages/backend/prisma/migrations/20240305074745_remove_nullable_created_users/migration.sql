/*
  Warnings:

  - Made the column `created` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `users` MODIFY `created` DATETIME(0) NOT NULL;
