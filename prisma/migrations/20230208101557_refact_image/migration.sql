/*
  Warnings:

  - You are about to drop the column `services` on the `Adherent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Adherent" DROP COLUMN "services",
ADD COLUMN     "servicesId" TEXT[];
