import ReviewService from "@/applications/services/ReviewService.js";
import ReviewScheduler from "@/domains/UserQuizState/ReviewScheduler.js";
import FsrsReviewAlgorithm from "../infra/fsrs/FsrsReviewAlgorithm.js";
import MysqlReviewTimeNormalizer from "../infra/MysqlReviewTimeNormalizer.js";

/** 具体的なライブラリ・保存時刻の方針は外側で組み立てる。 */
export function createReviewService() {
  return new ReviewService(
    new ReviewScheduler(new FsrsReviewAlgorithm()),
    new MysqlReviewTimeNormalizer(),
  );
}
