/*
  Warnings:

  - You are about to drop the column `photo_id` on the `Adherent` table. All the data in the column will be lost.
  - You are about to drop the `AssetImage` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `photoId` to the `Adherent` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Adherent" DROP CONSTRAINT "Adherent_photo_id_fkey";

-- DropIndex
DROP INDEX "Adherent_photo_id_key";

-- AlterTable
ALTER TABLE "Adherent" DROP COLUMN "photo_id",
ADD COLUMN     "photoId" TEXT NOT NULL;

-- DropTable
DROP TABLE "AssetImage";
