-- CreateTable
CREATE TABLE `Project` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RAIDItem` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `milestoneNo` INTEGER NULL,
    `dateRaised` DATETIME(3) NULL,
    `type` VARCHAR(191) NULL,
    `sprintDate` DATETIME(3) NULL,
    `category` VARCHAR(191) NULL,
    `probability` INTEGER NULL,
    `preventiveAction` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `impact` VARCHAR(191) NULL,
    `priority` VARCHAR(191) NULL,
    `confirmedBy` VARCHAR(191) NULL,
    `confirmationDate` DATETIME(3) NULL,
    `mitigationPlan` JSON NULL,
    `owner` VARCHAR(191) NULL,
    `dateClosed` DATETIME(3) NULL,
    `activitiesLog` JSON NULL,
    `actionItems` JSON NULL,
    `assignedTo` VARCHAR(191) NULL,
    `assignedOn` DATETIME(3) NULL,
    `remarks` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RAIDItem_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RAIDItem` ADD CONSTRAINT `RAIDItem_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `Project`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
