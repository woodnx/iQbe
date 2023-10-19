-- CreateTable
CREATE TABLE `SequelizeMeta` (
    `name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answer_logs` (
    `quiz_id` BIGINT NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `pressed_length` INTEGER NOT NULL,

    INDEX `quiz_id`(`quiz_id`),
    INDEX `user_id`(`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(125) NULL,
    `description` VARCHAR(256) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `favorites` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `quiz_id` BIGINT UNSIGNED NOT NULL,
    `registered` DATETIME(0) NOT NULL,

    INDEX `quiz_id`(`quiz_id`),
    PRIMARY KEY (`user_id`, `quiz_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `histories` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `quiz_id` BIGINT UNSIGNED NOT NULL,
    `practiced` DATETIME(0) NOT NULL,
    `judgement` TINYINT NOT NULL,
    `pressed_word` INTEGER NULL DEFAULT -1,

    INDEX `quiz_id`(`quiz_id`),
    PRIMARY KEY (`user_id`, `quiz_id`, `practiced`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `levels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(16) NOT NULL,
    `value` VARCHAR(16) NOT NULL,
    `color` VARCHAR(16) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `levels_staging` (
    `name` VARCHAR(16) NOT NULL,
    `value` VARCHAR(16) NOT NULL,
    `color` VARCHAR(16) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mylists` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `name` VARCHAR(128) NOT NULL DEFAULT '',
    `created` DATETIME(0) NOT NULL,
    `attr` INTEGER NOT NULL,
    `hash_ids` VARCHAR(20) NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mylists_quizzes` (
    `mylist_id` BIGINT UNSIGNED NOT NULL,
    `quiz_id` BIGINT UNSIGNED NOT NULL,
    `registered` DATETIME(0) NOT NULL,

    INDEX `mylist_id`(`mylist_id`),
    INDEX `quiz_id`(`quiz_id`),
    PRIMARY KEY (`mylist_id`, `quiz_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions_staging` (
    `workbook_id` INTEGER NULL,
    `que` VARCHAR(2048) NOT NULL,
    `ans` VARCHAR(256) NOT NULL,
    `anoans` VARCHAR(256) NULL,
    `attribute` VARCHAR(32) NULL,
    `total_crct_ans` INTEGER NULL,
    `total_wrng_ans` INTEGER NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quiz_reports` (
    `quiz_id` BIGINT NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `reason` VARCHAR(64) NULL DEFAULT '',
    `registered` DATETIME(0) NULL,

    INDEX `user_id`(`user_id`),
    PRIMARY KEY (`quiz_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quizzes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `workbook_id` INTEGER NULL,
    `que` VARCHAR(2048) NOT NULL,
    `ans` VARCHAR(256) NOT NULL,
    `anoans` VARCHAR(256) NULL,
    `attribute` VARCHAR(32) NULL,
    `total_crct_ans` INTEGER NULL,
    `total_wrng_ans` INTEGER NULL,
    `total_through_ans` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `quizzes_categories` (
    `quiz_id` BIGINT NOT NULL,
    `category_id` BIGINT NOT NULL,
    `sub_category_id` BIGINT NOT NULL,
    `user_id` BIGINT NOT NULL,

    INDEX `category_id`(`category_id`),
    INDEX `sub_category_id`(`sub_category_id`),
    PRIMARY KEY (`quiz_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sub_categories` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `parent_id` BIGINT NOT NULL,
    `name` VARCHAR(125) NULL,
    `description` VARCHAR(256) NULL,

    INDEX `parent_id`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_durations` (
    `quiz_id` INTEGER NOT NULL,
    `duration` DECIMAL(10, 6) NOT NULL
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_quizzes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `original_quiz_id` BIGINT NOT NULL,
    `test_id` INTEGER NOT NULL,

    INDEX `original_quiz_id`(`original_quiz_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tests_results` (
    `test_id` INTEGER NOT NULL,
    `quiz_id` INTEGER NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `judgement` TINYINT NOT NULL,
    `tested` DATETIME(0) NOT NULL,
    `pressed_time` DECIMAL(10, 6) NULL,

    INDEX `quiz_id`(`quiz_id`),
    INDEX `user_id`(`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `uid` VARCHAR(255) NOT NULL DEFAULT '',
    `nickname` VARCHAR(255) NOT NULL DEFAULT '',
    `modified` DATETIME(0) NOT NULL,
    `created` DATETIME(0) NULL,

    UNIQUE INDEX `uid`(`uid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users_settings` (
    `user_id` BIGINT UNSIGNED NOT NULL,
    `setting_id` BIGINT NOT NULL,
    `max_view` INTEGER NULL DEFAULT 100,
    `is_shuffle` BOOLEAN NULL DEFAULT false,
    `throw_count` INTEGER NULL DEFAULT 3,
    `ans_count` INTEGER NULL DEFAULT 5,

    INDEX `user_id`(`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `workbooks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NULL,
    `date` DATETIME(0) NULL,
    `level_id` INTEGER NULL,

    INDEX `level_id`(`level_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `answer_logs` ADD CONSTRAINT `answer_logs_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `histories` ADD CONSTRAINT `histories_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `histories` ADD CONSTRAINT `histories_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mylists` ADD CONSTRAINT `mylists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mylists_quizzes` ADD CONSTRAINT `mylists_quizzes_ibfk_1` FOREIGN KEY (`mylist_id`) REFERENCES `mylists`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `mylists_quizzes` ADD CONSTRAINT `mylists_quizzes_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `quiz_reports` ADD CONSTRAINT `quiz_reports_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `quizzes_categories` ADD CONSTRAINT `quizzes_categories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `quizzes_categories` ADD CONSTRAINT `quizzes_categories_ibfk_2` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sub_categories` ADD CONSTRAINT `sub_categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `tests_results` ADD CONSTRAINT `tests_results_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `users_settings` ADD CONSTRAINT `users_settings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `workbooks` ADD CONSTRAINT `workbooks_ibfk_1` FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

