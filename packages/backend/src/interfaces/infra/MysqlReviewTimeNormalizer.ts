import type IReviewTimeNormalizer from "@/applications/shared/IReviewTimeNormalizer.js";
import dayjs from "@/plugins/day.js";

/** 既存MySQL DATETIME(0)への保存・復元でも同じ瞬間になるよう秒へ切り捨てる。 */
export default class MysqlReviewTimeNormalizer implements IReviewTimeNormalizer {
  normalize(reviewedAt: Date): Date {
    const time = dayjs.utc(reviewedAt);
    if (!time.isValid()) {
      throw new RangeError("Review dates must be valid");
    }
    return time.startOf("second").toDate();
  }
}
