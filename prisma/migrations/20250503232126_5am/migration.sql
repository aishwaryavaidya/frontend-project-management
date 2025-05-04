-- AlterTable
ALTER TABLE `pmproject` ADD COLUMN `metadata` JSON NULL;

-- CreateTable
CREATE TABLE `ProjectPlan` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProjectPlan_projectId_key`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanTask` (
    `id` VARCHAR(191) NOT NULL,
    `siNo` INTEGER NOT NULL,
    `wbsNo` VARCHAR(191) NOT NULL,
    `taskName` VARCHAR(191) NOT NULL,
    `predecessorIds` VARCHAR(191) NULL,
    `level` INTEGER NOT NULL DEFAULT 0,
    `goLive` BOOLEAN NOT NULL DEFAULT false,
    `financialMilestone` BOOLEAN NOT NULL DEFAULT false,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `duration` INTEGER NULL,
    `actualStartDate` DATETIME(3) NULL,
    `actualEndDate` DATETIME(3) NULL,
    `actualDuration` INTEGER NULL,
    `progress` DOUBLE NOT NULL DEFAULT 0,
    `view` VARCHAR(191) NOT NULL DEFAULT 'External',
    `stageId` VARCHAR(191) NULL,
    `productId` VARCHAR(191) NULL,
    `isParent` BOOLEAN NOT NULL DEFAULT false,
    `financialValue` DOUBLE NULL,
    `plannedEndDate` DATETIME(3) NULL,
    `delayDays` INTEGER NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `projectPlanId` VARCHAR(191) NOT NULL,

    INDEX `PlanTask_siNo_idx`(`siNo`),
    INDEX `PlanTask_projectPlanId_idx`(`projectPlanId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Remark` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `author` VARCHAR(191) NOT NULL,
    `responseText` TEXT NULL,
    `responseAuthor` VARCHAR(191) NULL,
    `responseTimestamp` DATETIME(3) NULL,
    `taskId` VARCHAR(191) NULL,
    `projectPlanId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stage` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `colorCode` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProjectPlan` ADD CONSTRAINT `ProjectPlan_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `PMProject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanTask` ADD CONSTRAINT `PlanTask_stageId_fkey` FOREIGN KEY (`stageId`) REFERENCES `Stage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanTask` ADD CONSTRAINT `PlanTask_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanTask` ADD CONSTRAINT `PlanTask_projectPlanId_fkey` FOREIGN KEY (`projectPlanId`) REFERENCES `ProjectPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Remark` ADD CONSTRAINT `Remark_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `PlanTask`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Remark` ADD CONSTRAINT `Remark_projectPlanId_fkey` FOREIGN KEY (`projectPlanId`) REFERENCES `ProjectPlan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
