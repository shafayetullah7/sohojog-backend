/*
  Warnings:

  - You are about to drop the column `profilePicture` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_profilePicture_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "profilePicture",
ADD COLUMN     "profilePictureId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profilePictureId_fkey" FOREIGN KEY ("profilePictureId") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
