/*
  Warnings:

  - You are about to drop the column `submittedBy` on the `task_assignment_submissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[taskId]` on the table `task_submissions` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "task_assignment_submissions" DROP CONSTRAINT "task_assignment_submissions_submittedBy_fkey";

-- AlterTable
ALTER TABLE "task_assignment_submissions" DROP COLUMN "submittedBy",
ADD COLUMN     "participationId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "task_submissions_taskId_key" ON "task_submissions"("taskId");

-- AddForeignKey
ALTER TABLE "task_assignment_submissions" ADD CONSTRAINT "task_assignment_submissions_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "participations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
