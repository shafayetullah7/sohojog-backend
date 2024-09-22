-- DropForeignKey
ALTER TABLE "participantions" DROP CONSTRAINT "participantions_invitationId_fkey";

-- AlterTable
ALTER TABLE "participantions" ALTER COLUMN "invitationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "participantions" ADD CONSTRAINT "participantions_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
