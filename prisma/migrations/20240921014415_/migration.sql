-- CreateEnum
CREATE TYPE "ProjectAdminRole" AS ENUM ('MANAGER');

-- CreateTable
CREATE TABLE "project_admins" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "role" "ProjectAdminRole" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_admins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_admins_userId_projectId_role_key" ON "project_admins"("userId", "projectId", "role");

-- AddForeignKey
ALTER TABLE "project_admins" ADD CONSTRAINT "project_admins_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
