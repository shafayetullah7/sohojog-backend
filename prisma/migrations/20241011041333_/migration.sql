/*
  Warnings:

  - The `status` column on the `participantions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `assignedToId` on the `tasks` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[taskId]` on the table `manager_tasks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'REMOVED');

-- CreateEnum
CREATE TYPE "TeamTaskAssignStatus" AS ENUM ('PENDING', 'ASSIGNED', 'COMPLETED');

-- AlterTable
ALTER TABLE "participantions" DROP COLUMN "status",
ADD COLUMN     "status" "ParticipationStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "assignedToId",
ADD COLUMN     "budget" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "inableBudget" BOOLEAN NOT NULL DEFAULT false;

-- DropEnum
DROP TYPE "ParticipantionStatus";

-- CreateTable
CREATE TABLE "team_leader_tasks" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "teamLeaderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_leader_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_budget_transactions" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "transactionType" "TransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_budget_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaskAssignment" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "participationId" TEXT NOT NULL,

    CONSTRAINT "TaskAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_tasks" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "team_leader_tasks_taskId_key" ON "team_leader_tasks"("taskId");

-- CreateIndex
CREATE UNIQUE INDEX "team_tasks_taskId_teamId_key" ON "team_tasks"("taskId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "manager_tasks_taskId_key" ON "manager_tasks"("taskId");

-- AddForeignKey
ALTER TABLE "manager_tasks" ADD CONSTRAINT "manager_tasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manager_tasks" ADD CONSTRAINT "manager_tasks_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "project_admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_leader_tasks" ADD CONSTRAINT "team_leader_tasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_leader_tasks" ADD CONSTRAINT "team_leader_tasks_teamLeaderId_fkey" FOREIGN KEY ("teamLeaderId") REFERENCES "team_leaders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_budget_transactions" ADD CONSTRAINT "task_budget_transactions_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_tasks" ADD CONSTRAINT "team_tasks_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_tasks" ADD CONSTRAINT "team_tasks_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_tasks" ADD CONSTRAINT "team_tasks_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "project_admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
