-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `mobileNumber` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `role` ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `languagePref` VARCHAR(191) NOT NULL DEFAULT 'en',
    `passwordHash` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_mobileNumber_key`(`mobileNumber`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` VARCHAR(191) NOT NULL,
    `bookingCode` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `mobileNumber` VARCHAR(191) NOT NULL,
    `altMobile` VARCHAR(191) NULL,
    `fullAddress` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `pincode` VARCHAR(191) NOT NULL,
    `serviceType` VARCHAR(191) NOT NULL,
    `acType` VARCHAR(191) NOT NULL,
    `acBrand` VARCHAR(191) NOT NULL,
    `problemDescription` VARCHAR(191) NULL,
    `preferredDateTime` DATETIME(3) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `amount` DOUBLE NOT NULL DEFAULT 0.0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Booking_bookingCode_key`(`bookingCode`),
    INDEX `Booking_customerId_createdAt_idx`(`customerId`, `createdAt`),
    INDEX `Booking_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TechnicianActivity` (
    `id` VARCHAR(191) NOT NULL,
    `technicianName` VARCHAR(191) NOT NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `actionDescription` VARCHAR(191) NOT NULL,
    `bookingCode` VARCHAR(191) NULL,
    `clientName` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `statusBadge` VARCHAR(191) NOT NULL,
    `statusColor` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteSetting` (
    `id` VARCHAR(191) NOT NULL,
    `brandName` VARCHAR(191) NOT NULL,
    `emergencyPhone` VARCHAR(191) NOT NULL,
    `supportEmail` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `workingHours` VARCHAR(191) NOT NULL,
    `baseServiceFee` VARCHAR(191) NOT NULL,
    `gasRefillFee` VARCHAR(191) NOT NULL,
    `emergencyFee` VARCHAR(191) NOT NULL,
    `smsNotifications` BOOLEAN NOT NULL DEFAULT true,
    `emailAlerts` BOOLEAN NOT NULL DEFAULT true,
    `autoAssignTechnicians` BOOLEAN NOT NULL DEFAULT false,
    `sessionTimeoutMins` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
