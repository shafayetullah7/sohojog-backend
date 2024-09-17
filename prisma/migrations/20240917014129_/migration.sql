/*
  Warnings:

  - A unique constraint covering the columns `[projectId,email]` on the table `invitations` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "invitations_email_key";

-- CreateIndex
CREATE UNIQUE INDEX "invitations_projectId_email_key" ON "invitations"("projectId", "email");
