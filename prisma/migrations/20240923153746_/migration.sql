/*
  Warnings:

  - You are about to drop the column `teamResponsibilities` on the `teams` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "teams" DROP COLUMN "teamResponsibilities",
ADD COLUMN     "responsibilities" TEXT[];
