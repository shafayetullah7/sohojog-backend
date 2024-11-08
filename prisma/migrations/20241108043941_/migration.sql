/*
  Warnings:

  - The values [CANCELLED] on the enum `InviteStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InviteStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELED');
ALTER TABLE "invitations" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "invitations" ALTER COLUMN "status" TYPE "InviteStatus_new" USING ("status"::text::"InviteStatus_new");
ALTER TYPE "InviteStatus" RENAME TO "InviteStatus_old";
ALTER TYPE "InviteStatus_new" RENAME TO "InviteStatus";
DROP TYPE "InviteStatus_old";
ALTER TABLE "invitations" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
