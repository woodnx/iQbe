-- CreateTable
CREATE TABLE `user_quiz_states` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `quiz_id` BIGINT UNSIGNED NOT NULL,
    `state` ENUM('LEARNING', 'REVIEWING', 'RETAINED') NOT NULL,
    `review_count` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `success_streak` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `interval_days` INTEGER UNSIGNED NOT NULL,
    `last_reviewed_at` DATETIME(0) NULL,
    `next_review_at` DATETIME(0) NOT NULL,
    `updated_at` DATETIME(0) NOT NULL,

    INDEX `user_quiz_states_user_id_next_review_at_idx`(`user_id`, `next_review_at`),
    INDEX `user_quiz_states_quiz_id_idx`(`quiz_id`),
    PRIMARY KEY (`user_id`, `quiz_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_quiz_states` ADD CONSTRAINT `user_quiz_states_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_quiz_states` ADD CONSTRAINT `user_quiz_states_quiz_id_fkey` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;
