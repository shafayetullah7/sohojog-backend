/*
  Warnings:

  - You are about to drop the `group_rooms` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `project_groups` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `team_groups` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[roomId]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[groupId]` on the table `teams` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomId` to the `groups` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "group_rooms" DROP CONSTRAINT "group_rooms_groupId_fkey";

-- DropForeignKey
ALTER TABLE "group_rooms" DROP CONSTRAINT "group_rooms_id_fkey";

-- DropForeignKey
ALTER TABLE "project_groups" DROP CONSTRAINT "project_groups_groupId_fkey";

-- DropForeignKey
ALTER TABLE "project_groups" DROP CONSTRAINT "project_groups_projectId_fkey";

-- DropForeignKey
ALTER TABLE "team_groups" DROP CONSTRAINT "team_groups_groupId_fkey";

-- DropForeignKey
ALTER TABLE "team_groups" DROP CONSTRAINT "team_groups_teamId_fkey";

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "roomId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "groupId" TEXT;

-- AlterTable
ALTER TABLE "teams" ADD COLUMN     "groupId" TEXT;

-- DropTable
DROP TABLE "group_rooms";

-- DropTable
DROP TABLE "project_groups";

-- DropTable
DROP TABLE "team_groups";

-- CreateIndex
CREATE UNIQUE INDEX "groups_roomId_key" ON "groups"("roomId");

-- CreateIndex
CREATE UNIQUE INDEX "projects_groupId_key" ON "projects"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "teams_groupId_key" ON "teams"("groupId");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
