-- CreateTable
CREATE TABLE "project_groups" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_groups" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_groups_projectId_key" ON "project_groups"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_groups_groupId_key" ON "project_groups"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "team_groups_teamId_key" ON "team_groups"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "team_groups_groupId_key" ON "team_groups"("groupId");

-- AddForeignKey
ALTER TABLE "project_groups" ADD CONSTRAINT "project_groups_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_groups" ADD CONSTRAINT "project_groups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_groups" ADD CONSTRAINT "team_groups_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_groups" ADD CONSTRAINT "team_groups_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
