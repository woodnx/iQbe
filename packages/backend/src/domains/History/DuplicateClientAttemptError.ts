/** 同じユーザーの同じ clientAttemptId が既に保存されていた。保存処理は何も確定していない。 */
export default class DuplicateClientAttemptError extends Error {
  constructor(cause: unknown) {
    super("clientAttemptId is already recorded", { cause });
    this.name = "DuplicateClientAttemptError";
  }
}
