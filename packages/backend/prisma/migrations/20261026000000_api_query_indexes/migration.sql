-- Validate every public ID before any index DDL. Never rewrite existing IDs.
-- Run `pnpm --filter backend indexes:check` against the target DB beforehand.
DROP PROCEDURE IF EXISTS iqbe_check_api_ids;
CREATE PROCEDURE iqbe_check_api_ids()
BEGIN
  IF EXISTS (SELECT 1 FROM quizzes WHERE qid IS NULL OR TRIM(qid) = '')
     OR EXISTS (SELECT 1 FROM quizzes GROUP BY qid HAVING COUNT(*) > 1)
     OR EXISTS (SELECT 1 FROM workbooks WHERE wid IS NULL OR TRIM(wid) = '')
     OR EXISTS (SELECT 1 FROM workbooks GROUP BY wid HAVING COUNT(*) > 1)
     OR EXISTS (SELECT 1 FROM mylists WHERE mid IS NULL OR TRIM(mid) = '')
     OR EXISTS (SELECT 1 FROM mylists GROUP BY mid HAVING COUNT(*) > 1)
  THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'API index preflight failed: empty or duplicate qid/wid/mid. No IDs were changed.';
  END IF;
END;
CALL iqbe_check_api_ids();
DROP PROCEDURE iqbe_check_api_ids;

CREATE UNIQUE INDEX quizzes_qid_key ON quizzes(qid);
CREATE UNIQUE INDEX workbooks_wid_key ON workbooks(wid);
CREATE UNIQUE INDEX mylists_mid_key ON mylists(mid);
CREATE INDEX histories_user_practiced_idx ON histories(user_id, practiced);
CREATE INDEX histories_practiced_user_idx ON histories(practiced, user_id);
