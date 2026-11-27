-- Keep existing state/history unchanged; learned rows need an explicit FSRS backfill.
ALTER TABLE `user_quiz_states` ADD COLUMN `fsrs_memory` JSON NULL;
