/*
  Warnings:

  - Made the column `name` on table `categories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `sub_categories` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `categories` MODIFY `name` VARCHAR(125) NOT NULL;

-- AlterTable
ALTER TABLE `sub_categories` MODIFY `name` VARCHAR(125) NOT NULL;
