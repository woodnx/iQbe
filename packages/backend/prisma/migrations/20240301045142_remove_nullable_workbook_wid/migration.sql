/*
  Warnings:

  - Made the column `wid` on table `workbooks` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `workbooks` MODIFY `wid` VARCHAR(20) NOT NULL;
