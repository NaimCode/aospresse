/*
  Warnings:

  - You are about to drop the column `adherentId` on the `AssetImage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[photo_id]` on the table `Adherent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `photo_id` to the `Adherent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AssetImage" DROP CONSTRAINT "AssetImage_adherentId_fkey";

-- DropIndex
DROP INDEX "AssetImage_adherentId_key";

-- AlterTable
ALTER TABLE "Adherent" ADD COLUMN     "photo_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "AssetImage" DROP COLUMN "adherentId";

-- CreateIndex
CREATE UNIQUE INDEX "Adherent_photo_id_key" ON "Adherent"("photo_id");

-- AddForeignKey
ALTER TABLE "Adherent" ADD CONSTRAINT "Adherent_photo_id_fkey" FOREIGN KEY ("photo_id") REFERENCES "AssetImage"("fileKey") ON DELETE CASCADE ON UPDATE CASCADE;
