/*
  Warnings:

  - A unique constraint covering the columns `[projectId,name]` on the table `teams` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "teams_projectId_name_key" ON "teams"("projectId", "name");
