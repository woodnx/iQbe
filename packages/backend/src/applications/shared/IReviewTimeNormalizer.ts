/** 解答履歴と習熟更新で共有できる、保存可能な確定時刻を作る。 */
export default interface IReviewTimeNormalizer {
  normalize(reviewedAt: Date): Date;
}
