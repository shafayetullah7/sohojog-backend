-- DropForeignKey
ALTER TABLE "task_submissions" DROP CONSTRAINT "task_submissions_submittedBy_fkey";

-- AddForeignKey
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_submissions" ADD CONSTRAINT "task_submissions_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "team_task_assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
