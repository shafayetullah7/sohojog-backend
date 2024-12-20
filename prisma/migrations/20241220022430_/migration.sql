/*
  Warnings:

  - You are about to drop the `individual_messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "individual_messages" DROP CONSTRAINT "individual_messages_messageId_fkey";

-- DropForeignKey
ALTER TABLE "individual_messages" DROP CONSTRAINT "individual_messages_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "individual_messages" DROP CONSTRAINT "individual_messages_senderId_fkey";

-- DropTable
DROP TABLE "individual_messages";

-- CreateTable
CREATE TABLE "message_senders" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "message_senders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_receivers" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "message_receivers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_senders_senderId_idx" ON "message_senders"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "message_senders_messageId_senderId_key" ON "message_senders"("messageId", "senderId");

-- CreateIndex
CREATE INDEX "message_receivers_receiverId_idx" ON "message_receivers"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "message_receivers_messageId_receiverId_key" ON "message_receivers"("messageId", "receiverId");

-- AddForeignKey
ALTER TABLE "message_senders" ADD CONSTRAINT "message_senders_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_senders" ADD CONSTRAINT "message_senders_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_receivers" ADD CONSTRAINT "message_receivers_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_receivers" ADD CONSTRAINT "message_receivers_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
