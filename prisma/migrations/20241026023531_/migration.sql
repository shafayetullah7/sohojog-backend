/*
  Warnings:

  - You are about to drop the column `submittedById` on the `task_submissions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "task_submissions" DROP CONSTRAINT "task_submissions_submittedById_fkey";

-- AlterTable
ALTER TABLE "submission_files" ADD COLUMN     "assignmentSubmissionId" TEXT;

-- AlterTable
ALTER TABLE "task_submissions" DROP COLUMN "submittedById",
ADD COLUMN     "submittedBy" TEXT;

-- CreateTable
CREATE TABLE "task_assignment_submissions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "submittedBy" TEXT,
    "description" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL,

    CONSTRAINT "task_assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "task_assignment_submissions" ADD CONSTRAINT "task_assignment_submissions_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "participations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_assignment_submissions" ADD CONSTRAINT "task_assignment_submissions_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "team_task_assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "participations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_assignmentSubmissionId_fkey" FOREIGN KEY ("assignmentSubmissionId") REFERENCES "task_assignment_submissions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
