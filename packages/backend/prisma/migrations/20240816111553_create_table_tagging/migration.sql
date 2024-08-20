-- CreateTable
CREATE TABLE `tagging` (
    `tag_id` BIGINT NOT NULL,
    `quiz_id` BIGINT UNSIGNED NOT NULL,

    INDEX `tag_id`(`tag_id`),
    INDEX `quiz_id`(`quiz_id`),
    PRIMARY KEY (`tag_id`, `quiz_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tagging` ADD CONSTRAINT `tagging_ibfk_1` FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tagging` ADD CONSTRAINT `tagging_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
