-- DropForeignKey
ALTER TABLE "project_admins" DROP CONSTRAINT "project_admins_participationId_fkey";

-- AddForeignKey
ALTER TABLE "project_admins" ADD CONSTRAINT "project_admins_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "participantions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
