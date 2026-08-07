-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'SMS', 'BOTH');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "notifyVia" "NotificationChannel" NOT NULL DEFAULT 'EMAIL',
ADD COLUMN     "phone" TEXT;
