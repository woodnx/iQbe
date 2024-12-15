/*
  Warnings:

  - Made the column `mid` on table `mylists` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `mylists` MODIFY `mid` VARCHAR(20) NOT NULL DEFAULT '';
