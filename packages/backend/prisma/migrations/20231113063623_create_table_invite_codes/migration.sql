-- CreateTable
CREATE TABLE `invite_codes` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(32) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
