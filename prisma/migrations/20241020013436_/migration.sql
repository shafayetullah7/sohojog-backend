/*
  Warnings:

  - Added the required column `taskAssignmentType` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskAssignmentType" AS ENUM ('GROUP', 'INDIVIDUAL');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "taskAssignmentType" "TaskAssignmentType" NOT NULL;
