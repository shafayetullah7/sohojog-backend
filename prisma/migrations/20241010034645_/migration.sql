-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_createdBy_fkey";

-- CreateTable
CREATE TABLE "manager_tasks" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manager_tasks_pkey" PRIMARY KEY ("id")
);
