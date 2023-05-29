-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `image` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `isActif` BOOLEAN NOT NULL DEFAULT true,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `icon` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Adherent` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `num` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sexe` ENUM('M', 'F') NULL,
    `dateNaissance` VARCHAR(191) NULL,
    `lieuNaissance` VARCHAR(191) NULL,
    `familyStatus` ENUM('C', 'M', 'D', 'V') NULL,
    `childrenNumber` INTEGER NULL,
    `address` VARCHAR(191) NULL,
    `tel` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `profession` VARCHAR(191) NULL,
    `lieuTravail` VARCHAR(191) NULL,
    `cin` VARCHAR(191) NULL,
    `identifiant` VARCHAR(191) NULL,
    `identifiant2` VARCHAR(191) NULL,
    `anneeTravail` VARCHAR(191) NULL,
    `ville` VARCHAR(191) NULL,
    `sifa` ENUM('A', 'P') NULL,
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `dateDebutAbonnement` VARCHAR(191) NULL,
    `dateNouvelAbonnement` VARCHAR(191) NULL,
    `photoId` VARCHAR(191) NULL,

    UNIQUE INDEX `Adherent_num_key`(`num`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `activite` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `forChild` BOOLEAN NOT NULL DEFAULT false,
    `categoryId` VARCHAR(191) NOT NULL,

    INDEX `Service_categoryId_fkey`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Relation` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `montant` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `adherentId` VARCHAR(191) NOT NULL,
    `date` VARCHAR(191) NULL,
    `serviceId` VARCHAR(191) NOT NULL,

    INDEX `Relation_serviceId_fkey`(`serviceId`),
    UNIQUE INDEX `Relation_adherentId_serviceId_key`(`adherentId`, `serviceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Relation` ADD CONSTRAINT `Relation_adherentId_fkey` FOREIGN KEY (`adherentId`) REFERENCES `Adherent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Relation` ADD CONSTRAINT `Relation_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
