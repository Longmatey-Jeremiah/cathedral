-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'WIDOWED', 'DIVORCED');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "address" TEXT,
ADD COLUMN     "childrenNames" TEXT[],
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "declarationDate" TIMESTAMP(3),
ADD COLUMN     "hometown" TEXT,
ADD COLUMN     "maritalStatus" "MaritalStatus",
ADD COLUMN     "nextOfKin" TEXT,
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "parentsName" TEXT,
ADD COLUMN     "placeOfBirth" TEXT,
ADD COLUMN     "placeOfResidence" TEXT,
ADD COLUMN     "placeOfWork" TEXT,
ADD COLUMN     "religiousDenomination" TEXT,
ADD COLUMN     "sex" "Sex",
ADD COLUMN     "society" TEXT,
ADD COLUMN     "spouseName" TEXT,
ADD COLUMN     "spouseOccupation" TEXT;
