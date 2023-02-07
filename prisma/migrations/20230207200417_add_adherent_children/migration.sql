/*
  Warnings:

  - You are about to drop the column `activiteAdult` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `activiteChild` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `categorieIdAdult` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `categorieIdChild` on the `Service` table. All the data in the column will be lost.
  - You are about to drop the column `forAdult` on the `Service` table. All the data in the column will be lost.
  - The `forChild` column on the `Service` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `activite` to the `Service` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_categorieIdAdult_fkey";

-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_categorieIdChild_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "activiteAdult",
DROP COLUMN "activiteChild",
DROP COLUMN "categorieIdAdult",
DROP COLUMN "categorieIdChild",
DROP COLUMN "forAdult",
ADD COLUMN     "activite" TEXT NOT NULL,
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
DROP COLUMN "forChild",
ADD COLUMN     "forChild" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
