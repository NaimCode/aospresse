/*
  Warnings:

  - Added the required column `sifa` to the `Adherent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Sifa" AS ENUM ('A', 'P');

-- AlterTable
ALTER TABLE "Adherent" ADD COLUMN     "sifa" "Sifa" NOT NULL;
