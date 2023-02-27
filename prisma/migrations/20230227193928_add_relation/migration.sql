-- CreateTable
CREATE TABLE "Relation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "montant" TEXT NOT NULL,
    "description" TEXT,
    "adherentId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "Relation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Relation_adherentId_serviceId_key" ON "Relation"("adherentId", "serviceId");

-- AddForeignKey
ALTER TABLE "Relation" ADD CONSTRAINT "Relation_adherentId_fkey" FOREIGN KEY ("adherentId") REFERENCES "Adherent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Relation" ADD CONSTRAINT "Relation_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
