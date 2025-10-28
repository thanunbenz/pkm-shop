-- CreateTable
CREATE TABLE `SiteSettings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `welcomeTitle` VARCHAR(191) NOT NULL DEFAULT 'Welcome to PKM Shop',
    `welcomeSubtitle` TEXT NULL,
    `showWelcome` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
