-- CreateTable
CREATE TABLE `profile` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `nickname` VARCHAR(255) NULL,
    `photoUrl` VARCHAR(255) NULL,

    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profile` ADD CONSTRAINT `profile_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
