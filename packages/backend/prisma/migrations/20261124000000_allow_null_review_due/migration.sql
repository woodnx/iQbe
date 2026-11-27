-- AlterTable
ALTER TABLE `user_quiz_states` MODIFY `next_review_at` DATETIME(0) NULL;

-- 未学習の行に入っていた仮の期限（作成時刻など）を消し、「期限なし」に揃える。
UPDATE `user_quiz_states` SET `next_review_at` = NULL WHERE `last_reviewed_at` IS NULL;
