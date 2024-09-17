/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `invitations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `message` to the `invitations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "message" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "invitations_email_key" ON "invitations"("email");
