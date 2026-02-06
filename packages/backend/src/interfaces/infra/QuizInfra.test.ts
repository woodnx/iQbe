import CategoryInfra from "@/interfaces/infra/CategoryInfra";
import KyselyClientManager from "@/interfaces/infra/kysely/KyselyClientManager";
import QuizInfra from "@/interfaces/infra/QuizInfra";

type WhereCall = {
  table: string;
  column: string;
  op: string;
  value: unknown;
};

type MockState = {
  userId: number;
  whereCalls: WhereCall[];
};

class MockQueryBuilder {
  constructor(
    private table: string,
    private state: MockState,
  ) {}

  leftJoin() {
    return this;
  }

  innerJoin() {
    return this;
  }

  select(arg?: unknown) {
    if (typeof arg === "function") {
      arg({
        fn: {
          countAll: () => ({
            over: () => ({
              as: () => "size",
            }),
          }),
        },
      });
    }

    return this;
  }

  where(arg1: unknown, arg2?: unknown, arg3?: unknown) {
    if (typeof arg1 === "string" && typeof arg2 === "string") {
      this.state.whereCalls.push({
        table: this.table,
        column: arg1,
        op: arg2,
        value: arg3,
      });
    } else if (typeof arg1 === "function") {
      arg1({
        or: () => ({}),
      });
    }

    return this;
  }

  groupBy() {
    return this;
  }

  having() {
    return this;
  }

  orderBy() {
    return this;
  }

  limit() {
    return this;
  }

  offset() {
    return this;
  }

  distinct() {
    return this;
  }

  async executeTakeFirstOrThrow() {
    if (this.table === "users") return { id: this.state.userId };

    throw new Error("Unexpected executeTakeFirstOrThrow call");
  }

  async execute() {
    return [];
  }
}

const createMockClient = (state: MockState) => ({
  selectFrom: (table: string) => new MockQueryBuilder(table, state),
});

describe("QuizInfra", () => {
  it("他ユーザーのクイズが取得されないように絞り込む", async () => {
    const state: MockState = {
      userId: 42,
      whereCalls: [],
    };
    const clientManager = new KyselyClientManager();
    clientManager.setClient(createMockClient(state) as never);

    const categoryInfra = {
      findChainById: jest.fn().mockResolvedValue([]),
    } as unknown as CategoryInfra;

    const quizInfra = new QuizInfra(clientManager, categoryInfra);

    await quizInfra.findMany("user-a");

    const creatorFilter = state.whereCalls.find(
      (call) =>
        call.table === "quizzes" && call.column === "quizzes.creator_id",
    );

    expect(creatorFilter).toEqual({
      table: "quizzes",
      column: "quizzes.creator_id",
      op: "=",
      value: 42,
    });
  });
});
