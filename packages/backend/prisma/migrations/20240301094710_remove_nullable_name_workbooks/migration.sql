/*
  Warnings:

  - Made the column `name` on table `workbooks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `workbooks` MODIFY `name` VARCHAR(255) NOT NULL DEFAULT '';
