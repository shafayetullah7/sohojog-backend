/*
  Warnings:

  - You are about to drop the column `userId` on the `team_memberships` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[participationId,teamId]` on the table `team_memberships` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `participationId` to the `team_memberships` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_userId_fkey";

-- DropIndex
DROP INDEX "team_memberships_userId_teamId_key";

-- AlterTable
ALTER TABLE "team_memberships" DROP COLUMN "userId",
ADD COLUMN     "participationId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "team_memberships_participationId_teamId_key" ON "team_memberships"("participationId", "teamId");

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "participantions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
