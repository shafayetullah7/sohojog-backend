/*
  Warnings:

  - A unique constraint covering the columns `[projectId]` on the table `wallets` will be added. If there are existing duplicate values, this will fail.
  - Made the column `projectId` on table `wallets` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "wallets" DROP CONSTRAINT "wallets_projectId_fkey";

-- AlterTable
ALTER TABLE "wallets" ALTER COLUMN "projectId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "wallets_projectId_key" ON "wallets"("projectId");

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
