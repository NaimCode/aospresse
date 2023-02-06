/*
  Warnings:

  - You are about to drop the column `dateAbonnement` on the `Adherent` table. All the data in the column will be lost.
  - Added the required column `familleStatus` to the `Adherent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Adherent` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Adherent` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "FamilyStatus" AS ENUM ('C', 'M');

-- AlterTable
ALTER TABLE "Adherent" DROP COLUMN "dateAbonnement",
ADD COLUMN     "dateDebutAbonnement" TEXT,
ADD COLUMN     "dateNouvelAbonnement" TEXT,
ADD COLUMN     "familleStatus" "FamilyStatus" NOT NULL,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- CreateTable
CREATE TABLE "_AdherentToService" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AdherentToService_AB_unique" ON "_AdherentToService"("A", "B");

-- CreateIndex
CREATE INDEX "_AdherentToService_B_index" ON "_AdherentToService"("B");

-- AddForeignKey
ALTER TABLE "_AdherentToService" ADD CONSTRAINT "_AdherentToService_A_fkey" FOREIGN KEY ("A") REFERENCES "Adherent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AdherentToService" ADD CONSTRAINT "_AdherentToService_B_fkey" FOREIGN KEY ("B") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
