/*
  Warnings:

  - You are about to alter the column `description` on the `tasks` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(1300)`.

*/
-- AlterTable
ALTER TABLE "tasks" ALTER COLUMN "description" SET DATA TYPE VARCHAR(1300);

-- CreateTable
CREATE TABLE "TaskAttachments" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaskAttachments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TaskAttachments" ADD CONSTRAINT "TaskAttachments_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TaskAttachments" ADD CONSTRAINT "TaskAttachments_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
