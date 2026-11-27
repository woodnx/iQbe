import { ApiClientError } from "@/utils/client";

/**
 * この画面のまま再送しても成功しない保存失敗の HTTP ステータス。
 * 400・404・409 は同じ内容では何度送っても成功しない。401 は、期限切れのトークンを
 * auth-fetch が更新・再送しても通らなかった場合で、ログインし直せば同じ内容で成功し得るが、
 * 送信中の解答をログイン後に引き継ぐ仕組みは無いため、この解答は破棄してログイン画面へ移る。
 */
export type RejectedStatus = 400 | 401 | 404 | 409;

const REJECTED_STATUSES: readonly number[] = [400, 401, 404, 409];

export const REJECTION_MESSAGES: Record<
  RejectedStatus,
  { title: string; message: string }
> = {
  400: {
    title: "入力が不正です",
    message: "解答の内容が不正なため保存できませんでした。",
  },
  401: {
    title: "ログインが必要です",
    message: "ログインの有効期限が切れたため、解答を保存できませんでした。",
  },
  404: {
    title: "問題は削除済みです",
    message: "この問題は削除されたため、解答を保存できませんでした。",
  },
  409: {
    title: "解答 ID が競合しています",
    message: "同じ解答 ID で異なる解答が保存済みのため、保存できませんでした。",
  },
};

export function toRejectedStatus(error: unknown): RejectedStatus | null {
  if (!(error instanceof ApiClientError)) return null;
  return REJECTED_STATUSES.includes(error.status)
    ? (error.status as RejectedStatus)
    : null;
}
