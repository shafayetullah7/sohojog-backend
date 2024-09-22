/*
  Warnings:

  - You are about to drop the column `managerId` on the `projects` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[creatorId,title]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creatorId` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "participantions" DROP CONSTRAINT "participantions_projectId_fkey";

-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_managerId_fkey";

-- DropIndex
DROP INDEX "projects_managerId_title_key";

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "managerId",
ADD COLUMN     "creatorId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "projects_creatorId_title_key" ON "projects"("creatorId", "title");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participantions" ADD CONSTRAINT "participantions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
