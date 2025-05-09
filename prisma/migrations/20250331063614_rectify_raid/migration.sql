/*
  Warnings:

  - The primary key for the `task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `actualEnd` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `actualStart` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `apSpoc` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `clientSpoc` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `index` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `milestoneId` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `progress` on the `task` table. All the data in the column will be lost.
  - You are about to drop the column `projectManager` on the `task` table. All the data in the column will be lost.
  - You are about to drop the `milestone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `phase` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[siNo]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `siNo` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taskName` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wbsNo` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `assignment` DROP FOREIGN KEY `Assignment_taskId_fkey`;

-- DropForeignKey
ALTER TABLE `milestone` DROP FOREIGN KEY `Milestone_phaseId_fkey`;

-- DropForeignKey
ALTER TABLE `task` DROP FOREIGN KEY `Task_milestoneId_fkey`;

-- AlterTable
ALTER TABLE `task` DROP PRIMARY KEY,
    DROP COLUMN `actualEnd`,
    DROP COLUMN `actualStart`,
    DROP COLUMN `apSpoc`,
    DROP COLUMN `clientSpoc`,
    DROP COLUMN `index`,
    DROP COLUMN `milestoneId`,
    DROP COLUMN `name`,
    DROP COLUMN `progress`,
    DROP COLUMN `projectManager`,
    ADD COLUMN `actualDuration` INTEGER NULL,
    ADD COLUMN `actualEndDate` DATETIME(3) NULL,
    ADD COLUMN `actualStartDate` DATETIME(3) NULL,
    ADD COLUMN `duration` INTEGER NULL,
    ADD COLUMN `isMilestone` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `level` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `predecessorIds` VARCHAR(191) NULL,
    ADD COLUMN `siNo` INTEGER NOT NULL,
    ADD COLUMN `taskName` VARCHAR(191) NOT NULL,
    ADD COLUMN `wbsNo` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    MODIFY `startDate` DATETIME(3) NULL,
    MODIFY `endDate` DATETIME(3) NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `milestone`;

-- DropTable
DROP TABLE `phase`;

-- CreateIndex
CREATE UNIQUE INDEX `Task_siNo_key` ON `Task`(`siNo`);

-- CreateIndex
CREATE INDEX `Task_siNo_idx` ON `Task`(`siNo`);

-- CreateIndex
CREATE INDEX `Task_level_idx` ON `Task`(`level`);

-- CreateIndex
CREATE INDEX `Task_predecessorIds_idx` ON `Task`(`predecessorIds`);
