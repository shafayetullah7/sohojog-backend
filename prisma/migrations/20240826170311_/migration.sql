/*
  Warnings:

  - You are about to drop the column `googleProfilePicture` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "googleProfilePicture",
ADD COLUMN     "profilePicture" TEXT;
