-- CreateTable
CREATE TABLE `Cupon` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(50) NOT NULL,
    `jenis_diskon` ENUM('persentase', 'nominal') NOT NULL,
    `nilai_diskon` DECIMAL(65, 30) NOT NULL,
    `expiration` DATETIME(3) NOT NULL,
    `is_active` BOOLEAN NOT NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Cupon_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cupon` ADD CONSTRAINT `Cupon_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
