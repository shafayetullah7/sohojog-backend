/*
  Warnings:

  - You are about to drop the column `googleAccessToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleLocale` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleRefreshToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `googleTokenExpiry` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "googleAccessToken",
DROP COLUMN "googleLocale",
DROP COLUMN "googleRefreshToken",
DROP COLUMN "googleTokenExpiry",
ADD COLUMN     "hasPassword" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "password" DROP NOT NULL;
