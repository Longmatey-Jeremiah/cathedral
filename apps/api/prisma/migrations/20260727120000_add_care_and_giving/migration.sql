-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'MEMBER_CARE';

-- CreateEnum
CREATE TYPE "CareType" AS ENUM ('VISIT', 'CALL', 'PRAYER', 'COUNSEL', 'FOLLOW_UP');

-- CreateEnum
CREATE TYPE "GivingMethod" AS ENUM ('CASH', 'TRANSFER', 'CARD', 'MOBILE_MONEY');

-- CreateTable
CREATE TABLE "CareNote" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "type" "CareType" NOT NULL,
    "body" TEXT NOT NULL,
    "confidential" BOOLEAN NOT NULL DEFAULT false,
    "followUpAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fund" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Fund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "churchId" TEXT NOT NULL,
    "memberId" TEXT,
    "fundId" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "method" "GivingMethod" NOT NULL,
    "reference" TEXT,
    "note" TEXT,
    "providerRef" TEXT,
    "reversesId" TEXT,
    "recordedById" TEXT NOT NULL,
    "givenAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CareNote_churchId_memberId_idx" ON "CareNote"("churchId", "memberId");

-- CreateIndex
CREATE INDEX "CareNote_churchId_followUpAt_idx" ON "CareNote"("churchId", "followUpAt");

-- CreateIndex
CREATE INDEX "Fund_churchId_isActive_idx" ON "Fund"("churchId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Fund_churchId_name_key" ON "Fund"("churchId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_providerRef_key" ON "Donation"("providerRef");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_reversesId_key" ON "Donation"("reversesId");

-- CreateIndex
CREATE INDEX "Donation_churchId_givenAt_idx" ON "Donation"("churchId", "givenAt");

-- CreateIndex
CREATE INDEX "Donation_churchId_fundId_idx" ON "Donation"("churchId", "fundId");

-- CreateIndex
CREATE INDEX "Donation_memberId_idx" ON "Donation"("memberId");

-- AddForeignKey
ALTER TABLE "CareNote" ADD CONSTRAINT "CareNote_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareNote" ADD CONSTRAINT "CareNote_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareNote" ADD CONSTRAINT "CareNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fund" ADD CONSTRAINT "Fund_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_churchId_fkey" FOREIGN KEY ("churchId") REFERENCES "Church"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_reversesId_fkey" FOREIGN KEY ("reversesId") REFERENCES "Donation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
