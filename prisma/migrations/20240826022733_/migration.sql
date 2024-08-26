/*
  Warnings:

  - A unique constraint covering the columns `[googleId,id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleAccessToken" TEXT,
ADD COLUMN     "googleEmailVerified" BOOLEAN,
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "googleLocale" TEXT,
ADD COLUMN     "googleProfilePicture" TEXT,
ADD COLUMN     "googleProfileUrl" TEXT,
ADD COLUMN     "googleRefreshToken" TEXT,
ADD COLUMN     "googleTokenExpiry" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_id_key" ON "User"("googleId", "id");
