-- DropForeignKey
ALTER TABLE "submission_files" DROP CONSTRAINT "submission_files_submissionId_fkey";

-- AlterTable
ALTER TABLE "submission_files" ALTER COLUMN "submissionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "task_submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
