/*
  Warnings:

  - You are about to drop the column `projectId` on the `project_admins` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `project_admins` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[participationId,role]` on the table `project_admins` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `participationId` to the `project_admins` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "project_admins" DROP CONSTRAINT "project_admins_userId_fkey";

-- DropIndex
DROP INDEX "project_admins_userId_projectId_role_key";

-- AlterTable
ALTER TABLE "project_admins" DROP COLUMN "projectId",
DROP COLUMN "userId",
ADD COLUMN     "participationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "project_admins_participationId_role_key" ON "project_admins"("participationId", "role");

-- AddForeignKey
ALTER TABLE "project_admins" ADD CONSTRAINT "project_admins_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "participantions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
