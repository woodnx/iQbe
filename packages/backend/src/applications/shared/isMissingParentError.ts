import { NoResultError } from "kysely";

/**
 * 処理中に親（ユーザー・問題）が削除されたときに出るエラーか。ID 検索の
 * NoResultError と、ID 検索後に削除された場合の MySQL の外部キーエラーの 2 種類。
 */
export const isMissingParentError = (error: unknown): boolean =>
  error instanceof NoResultError ||
  (error instanceof Error &&
    "code" in error &&
    error.code === "ER_NO_REFERENCED_ROW_2");
