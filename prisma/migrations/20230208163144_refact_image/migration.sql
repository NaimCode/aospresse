/*
  Warnings:

  - A unique constraint covering the columns `[idNum]` on the table `Adherent` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Adherent" ADD COLUMN     "idNum" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Adherent_idNum_key" ON "Adherent"("idNum");
