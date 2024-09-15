/*
  Warnings:

  - A unique constraint covering the columns `[managerId,title]` on the table `projects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "projects_managerId_title_key" ON "projects"("managerId", "title");
