/*
  Warnings:

  - You are about to drop the column `participantionId` on the `invitations` table. All the data in the column will be lost.
  - You are about to drop the `participantions` table. If the table is not empty, all the data it contains will be lost.

*/
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

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "participantionId",
ADD COLUMN     "participationId" TEXT;

-- DropTable
DROP TABLE "participantions";

-- CreateTable
CREATE TABLE "participations" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "ParticipationRole" NOT NULL DEFAULT 'MEMBER',
    "invitationId" TEXT,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "participations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "participations_invitationId_key" ON "participations"("invitationId");

-- CreateIndex
CREATE UNIQUE INDEX "participations_projectId_userId_key" ON "participations"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "project_admins" ADD CONSTRAINT "project_admins_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "participations" ADD CONSTRAINT "participations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_memberships" ADD CONSTRAINT "team_memberships_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "participations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
