/*
  Warnings:

  - You are about to drop the `participantions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ParticipationRole" AS ENUM ('MEMBER');

-- DropForeignKey
ALTER TABLE "participantions" DROP CONSTRAINT "participantions_invitationId_fkey";

-- DropForeignKey
ALTER TABLE "participantions" DROP CONSTRAINT "participantions_projectId_fkey";

-- DropForeignKey
ALTER TABLE "participantions" DROP CONSTRAINT "participantions_userId_fkey";

-- DropForeignKey
ALTER TABLE "project_admins" DROP CONSTRAINT "project_admins_participationId_fkey";

-- DropForeignKey
ALTER TABLE "team_memberships" DROP CONSTRAINT "team_memberships_participationId_fkey";

-- DropTable
DROP TABLE "participantions";

-- DropEnum
DROP TYPE "ParticipantionRole";

-- CreateTable
CREATE TABLE "participation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "ParticipationRole" NOT NULL DEFAULT 'MEMBER',
    "invitationId" TEXT,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participation_invitationId_key" ON "participation"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "participation_projectId_userId_key" ON "participation"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "project_admins" ADD CONSTRAINT "project_admins_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "participation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participation" ADD CONSTRAINT "participation_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participation" ADD CONSTRAINT "participation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participation" ADD CONSTRAINT "participation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "participation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
