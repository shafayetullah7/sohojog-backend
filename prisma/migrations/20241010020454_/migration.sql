/*
  Warnings:

  - You are about to drop the column `role` on the `project_admins` table. All the data in the column will be lost.
  - You are about to drop the column `projectWalletId` on the `team_transactions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[participationId]` on the table `project_admins` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdBy` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectWalletTransactionId` to the `team_transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "team_transactions" DROP CONSTRAINT "team_transactions_projectWalletId_fkey";

-- DropIndex
DROP INDEX "project_admins_participationId_role_key";

-- AlterTable
ALTER TABLE "project_admins" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "team_transactions" DROP COLUMN "projectWalletId",
ADD COLUMN     "projectWalletTransactionId" TEXT NOT NULL,
ADD COLUMN     "transactionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "project_admins_participationId_key" ON "project_admins"("participationId");

-- AddForeignKey
ALTER TABLE "team_transactions" ADD CONSTRAINT "team_transactions_projectWalletTransactionId_fkey" FOREIGN KEY ("projectWalletTransactionId") REFERENCES "wallet_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "participantions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
