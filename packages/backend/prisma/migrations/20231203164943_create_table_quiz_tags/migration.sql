-- CreateTable
CREATE TABLE `quiz_tags` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(128) NOT NULL,
    `color` VARCHAR(64) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
