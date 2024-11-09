-- AlterTable
ALTER TABLE "participations" ADD COLUMN     "designation" TEXT[] DEFAULT ARRAY[]::TEXT[];
