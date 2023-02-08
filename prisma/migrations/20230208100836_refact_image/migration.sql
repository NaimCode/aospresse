/*
  Warnings:

  - You are about to drop the `_AdherentToService` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AdherentToService" DROP CONSTRAINT "_AdherentToService_A_fkey";

-- DropForeignKey
ALTER TABLE "_AdherentToService" DROP CONSTRAINT "_AdherentToService_B_fkey";

-- AlterTable
ALTER TABLE "Adherent" ADD COLUMN     "services" TEXT[];

-- DropTable
DROP TABLE "_AdherentToService";
