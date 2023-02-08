/*
  Warnings:

  - You are about to drop the column `idNum` on the `Adherent` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[num]` on the table `Adherent` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Adherent_idNum_key";

-- AlterTable
ALTER TABLE "Adherent" DROP COLUMN "idNum",
ADD COLUMN     "num" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Adherent_num_key" ON "Adherent"("num");
