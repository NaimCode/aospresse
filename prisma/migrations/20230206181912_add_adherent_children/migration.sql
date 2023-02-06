/*
  Warnings:

  - Made the column `cin` on table `Adherent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Adherent" ALTER COLUMN "cin" SET NOT NULL;

-- CreateTable
CREATE TABLE "AssetImage" (
    "name" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "adherentId" TEXT NOT NULL,

    CONSTRAINT "AssetImage_pkey" PRIMARY KEY ("fileKey")
);

-- CreateIndex
CREATE UNIQUE INDEX "AssetImage_fileKey_key" ON "AssetImage"("fileKey");

-- CreateIndex
CREATE UNIQUE INDEX "AssetImage_adherentId_key" ON "AssetImage"("adherentId");

-- AddForeignKey
ALTER TABLE "AssetImage" ADD CONSTRAINT "AssetImage_adherentId_fkey" FOREIGN KEY ("adherentId") REFERENCES "Adherent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
