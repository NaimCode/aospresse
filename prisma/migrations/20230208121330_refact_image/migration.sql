/*
  Warnings:

  - You are about to drop the column `children` on the `Adherent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Adherent" DROP COLUMN "children",
ADD COLUMN     "childrenNumber" INTEGER;
