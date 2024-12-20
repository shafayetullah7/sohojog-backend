/*
  Warnings:

  - You are about to drop the `group_members` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "group_members" DROP CONSTRAINT "group_members_groupId_fkey";

-- DropForeignKey
ALTER TABLE "group_members" DROP CONSTRAINT "group_members_userId_fkey";

-- DropTable
DROP TABLE "group_members";
