/*
  Warnings:

  - You are about to drop the column `familleStatus` on the `Adherent` table. All the data in the column will be lost.
  - Added the required column `familyStatus` to the `Adherent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Adherent" DROP COLUMN "familleStatus",
ADD COLUMN     "children" INTEGER,
ADD COLUMN     "familyStatus" "FamilyStatus" NOT NULL;
