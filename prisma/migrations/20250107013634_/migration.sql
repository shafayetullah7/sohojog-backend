-- DropForeignKey
ALTER TABLE "task_submissions" DROP CONSTRAINT "task_submissions_submittedBy_fkey";

-- AlterTable
ALTER TABLE "task_assignment_submissions" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "task_submissions" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "participations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
