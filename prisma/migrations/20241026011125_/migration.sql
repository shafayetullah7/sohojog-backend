-- AlterTable
ALTER TABLE "team_task_assignment" ALTER COLUMN "assignedAt" DROP NOT NULL,
ALTER COLUMN "assignedAt" SET DEFAULT CURRENT_TIMESTAMP;
