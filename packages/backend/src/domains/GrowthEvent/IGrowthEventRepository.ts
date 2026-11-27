import type GrowthEvent from "./index.js";
import type { GrowthEventType } from "./index.js";

export default interface IGrowthEventRepository {
  /** ユーザーと問題は、各イベントが属する履歴の値で保存する。 */
  insertAll(events: readonly GrowthEvent[]): Promise<void>;
  /** FIRST_CORRECT、REVENGE_SUCCESS、REVIEW_SUCCESS の順で返す。 */
  listTypesByHistoryId(historyId: bigint): Promise<GrowthEventType[]>;
}
