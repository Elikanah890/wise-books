-- AlterTable
ALTER TABLE `books` ADD COLUMN `format` VARCHAR(191) NOT NULL DEFAULT 'PDF',
    ADD COLUMN `is_best_seller` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `is_ebook` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `is_featured` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `language` VARCHAR(191) NOT NULL DEFAULT 'English',
    ADD COLUMN `pages` INTEGER NULL,
    ADD COLUMN `publisher` VARCHAR(191) NULL,
    ADD COLUMN `rating` DOUBLE NULL;

-- CreateTable
CREATE TABLE `site_settings` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `data` JSON NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `books_is_ebook_idx` ON `books`(`is_ebook`);

-- CreateIndex
CREATE INDEX `books_is_featured_idx` ON `books`(`is_featured`);

-- CreateIndex
CREATE INDEX `books_is_best_seller_idx` ON `books`(`is_best_seller`);

