/*
  Warnings:

  - A unique constraint covering the columns `[assignmentId]` on the table `task_assignment_submissions` will be added. If there are existing duplicate values, this will fail.
  - Made the column `submittedBy` on table `task_submissions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "task_assignment_submissions" DROP CONSTRAINT "task_assignment_submissions_participationId_fkey";

-- AlterTable
ALTER TABLE "task_submissions" ALTER COLUMN "submittedBy" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "task_assignment_submissions_assignmentId_key" ON "task_assignment_submissions"("assignmentId");
