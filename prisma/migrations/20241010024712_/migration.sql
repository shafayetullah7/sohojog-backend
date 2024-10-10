/*
  Warnings:

  - You are about to drop the `team_member_roles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "team_member_roles" DROP CONSTRAINT "team_member_roles_membershipId_fkey";

-- DropTable
DROP TABLE "team_member_roles";

-- CreateTable
CREATE TABLE "team_leaders" (
    "id" TEXT NOT NULL,
    "membershipId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "team_leaders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_leaders_membershipId_key" ON "team_leaders"("membershipId");

-- AddForeignKey
ALTER TABLE "team_leaders" ADD CONSTRAINT "team_leaders_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "team_memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
