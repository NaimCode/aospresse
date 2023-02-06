-- CreateEnum
CREATE TYPE "Sexe" AS ENUM ('M', 'F');

-- CreateTable
CREATE TABLE "Adherent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sexe" "Sexe" NOT NULL,
    "dateNaissance" TEXT,
    "lieuNaissance" TEXT,
    "tel" TEXT,
    "email" TEXT,
    "profession" TEXT,
    "lieuTravail" TEXT,
    "cin" TEXT,
    "identifiant" TEXT,
    "anneeTravail" TEXT,
    "dateAbonnement" TEXT,

    CONSTRAINT "Adherent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "forChild" TEXT,
    "forAdult" TEXT,
    "activiteChild" TEXT,
    "activiteAdult" TEXT,
    "categorieIdChild" TEXT NOT NULL,
    "categorieIdAdult" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categorieIdChild_fkey" FOREIGN KEY ("categorieIdChild") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_categorieIdAdult_fkey" FOREIGN KEY ("categorieIdAdult") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
