/*
  Warnings:

  - You are about to drop the column `senderId` on the `group_messages` table. All the data in the column will be lost.
  - You are about to drop the `message_senders` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `senderId` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "group_messages" DROP CONSTRAINT "group_messages_senderId_fkey";

-- DropForeignKey
ALTER TABLE "message_senders" DROP CONSTRAINT "message_senders_messageId_fkey";

-- DropForeignKey
ALTER TABLE "message_senders" DROP CONSTRAINT "message_senders_senderId_fkey";

-- DropIndex
DROP INDEX "group_messages_senderId_idx";

-- AlterTable
ALTER TABLE "group_messages" DROP COLUMN "senderId";

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "senderId" TEXT NOT NULL;

-- DropTable
DROP TABLE "message_senders";

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
