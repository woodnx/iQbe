import UserQuizState from ".";

describe("エンティティ `UserQuizState` の単体テスト", () => {
  it("初回作成時は最終復習日時を持たない", () => {
    const uid = "test-uid";
    const qid = "test-qid";

    const result = UserQuizState.create(uid, qid);

    expect(result.lastReviewedAt).equal(null);
  });
});
