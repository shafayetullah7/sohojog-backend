/*
  Warnings:

  - You are about to drop the column `projectPriority` on the `projects` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "projects" DROP COLUMN "projectPriority",
ADD COLUMN     "priority" "ProjectPriority" NOT NULL DEFAULT 'MEDIUM';
