-- AlterTable
ALTER TABLE `histories` ADD COLUMN `daily_attempt_number` INTEGER UNSIGNED NULL,
    ADD COLUMN `next_review_at` DATETIME(0) NULL,
    ADD COLUMN `practice_mode` ENUM('FREE', 'DAILY_SET', 'SMART_REVIEW') NULL,
    ADD COLUMN `previous_judgement` TINYINT NULL,
    ADD COLUMN `review_settings_version` INTEGER UNSIGNED NULL,
    ADD COLUMN `review_state` ENUM('LEARNING', 'REVIEWING', 'RETAINED') NULL,
    ADD COLUMN `study_date` DATE NULL;

-- CreateTable
CREATE TABLE `growth_events` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `quiz_id` BIGINT UNSIGNED NOT NULL,
    `history_id` BIGINT UNSIGNED NOT NULL,
    `type` ENUM('FIRST_CORRECT', 'REVENGE_SUCCESS', 'REVIEW_SUCCESS') NOT NULL,
    `occurred_at` DATETIME(0) NOT NULL,

    INDEX `growth_events_user_id_occurred_at_idx`(`user_id`, `occurred_at`),
    INDEX `growth_events_quiz_id_idx`(`quiz_id`),
    UNIQUE INDEX `growth_events_history_id_type_key`(`history_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `histories_user_id_quiz_id_study_date_daily_attempt_number_key` ON `histories`(`user_id`, `quiz_id`, `study_date`, `daily_attempt_number`);

-- AddForeignKey
ALTER TABLE `growth_events` ADD CONSTRAINT `growth_events_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `growth_events` ADD CONSTRAINT `growth_events_quiz_id_fkey` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `growth_events` ADD CONSTRAINT `growth_events_history_id_fkey` FOREIGN KEY (`history_id`) REFERENCES `histories`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

