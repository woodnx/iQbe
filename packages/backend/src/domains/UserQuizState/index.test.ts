import UserQuizState from ".";

describe("エンティティ `UserQuizState` の単体テスト", () => {
  it("初回作成時は最終復習日時も復習期限も持たない", () => {
    const result = UserQuizState.create("test-uid", "test-qid");

    expect(result.lastReviewedAt).toBeNull();
    expect(result.nextReviewAt).toBeNull();
  });

  it.each([
    ["解答済みなのに期限が無い", new Date("2026-11-16T03:00:00Z"), null],
    ["未学習なのに期限がある", null, new Date("2026-11-16T03:00:00Z")],
  ] as const)("%s状態は作れない", (_, lastReviewedAt, nextReviewAt) => {
    expect(
      () =>
        new UserQuizState(
          "test-uid",
          "test-qid",
          "LEARNING",
          0,
          0,
          0,
          lastReviewedAt,
          nextReviewAt,
        ),
    ).toThrow(RangeError);
  });
});
