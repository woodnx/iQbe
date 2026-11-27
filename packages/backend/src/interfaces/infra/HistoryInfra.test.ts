import {
  type CompiledQuery,
  type DatabaseConnection,
  type Driver,
  Kysely,
  MysqlAdapter,
  MysqlIntrospector,
  MysqlQueryCompiler,
  NoResultError,
  type QueryResult,
} from "kysely";
import { isMissingParentError } from "@/applications/shared/isMissingParentError.js";
import type { DB } from "@/db/types.js";
import DuplicateClientAttemptError from "@/domains/History/DuplicateClientAttemptError.js";
import History from "@/domains/History/index.js";
import HistoryInfra from "./HistoryInfra.js";
import type KyselyClientManager from "./kysely/KyselyClientManager.js";

vi.mock("@/database.js", () => ({ db: {} }));

/** 本物のクエリビルダーで SQL を組み立て、DB の応答だけを差し替える。 */
function fakeDatabase(respond: (query: CompiledQuery) => QueryResult<unknown>) {
  const executed: CompiledQuery[] = [];
  const connection: DatabaseConnection = {
    async executeQuery<R>(query: CompiledQuery) {
      executed.push(query);
      return respond(query) as QueryResult<R>;
    },
    // oxlint-disable-next-line require-yield
    async *streamQuery() {
      throw new Error("Streaming is not used");
    },
  };
  const driver: Driver = {
    init: async () => {},
    acquireConnection: async () => connection,
    beginTransaction: async () => {},
    commitTransaction: async () => {},
    rollbackTransaction: async () => {},
    releaseConnection: async () => {},
    destroy: async () => {},
  };
  const client = new Kysely<DB>({
    dialect: {
      createAdapter: () => new MysqlAdapter(),
      createDriver: () => driver,
      createIntrospector: (db) => new MysqlIntrospector(db),
      createQueryCompiler: () => new MysqlQueryCompiler(),
    },
  });
  const manager = { getClient: () => client } as unknown as KyselyClientManager;
  return { repository: new HistoryInfra(manager), executed };
}

const failingInsert = (error: Error) =>
  fakeDatabase(() => {
    throw error;
  });

const history = (
  attemptId: string | null = "c382ab80-f895-42a7-9c36-1bba967ef26f",
) => new History("q1", "owner", 0, 1, new Date(), attemptId);

describe("HistoryInfra insert failures", () => {
  it("propagates database failures other than duplicate keys", async () => {
    const error = Object.assign(new Error("connection lost"), {
      code: "PROTOCOL_CONNECTION_LOST",
    });
    const { repository, executed } = failingInsert(error);
    await expect(repository.add(history())).rejects.toBe(error);
    expect(executed).toHaveLength(1);
  });

  it("reports a duplicate key as DuplicateClientAttemptError carrying the original error", async () => {
    const error = Object.assign(new Error("duplicate key"), {
      code: "ER_DUP_ENTRY",
    });
    const { repository } = failingInsert(error);
    const added = repository.add(history());
    await expect(added).rejects.toBeInstanceOf(DuplicateClientAttemptError);
    await expect(added).rejects.toMatchObject({ cause: error });
  });

  it("does not treat a legacy NULL attempt ID as an idempotency key", async () => {
    const error = Object.assign(new Error("duplicate key"), {
      code: "ER_DUP_ENTRY",
    });
    const { repository } = failingInsert(error);
    await expect(repository.add(history(null))).rejects.toBe(error);
  });

  it("reports a missing user or quiz as the missing-parent error when nothing is inserted", async () => {
    const { repository } = fakeDatabase(() => ({
      rows: [],
      numAffectedRows: 0n,
    }));
    const added = repository.add(history());
    await expect(added).rejects.toBeInstanceOf(NoResultError);
    expect(isMissingParentError(await added.catch((error) => error))).toBe(
      true,
    );
  });
});

describe("HistoryInfra.add", () => {
  it("resolves the user and the quiz inside the single INSERT statement", async () => {
    const { repository, executed } = fakeDatabase(() => ({
      rows: [],
      insertId: 1n,
      numAffectedRows: 1n,
    }));
    await repository.add(history());

    expect(executed).toHaveLength(1);
    expect(executed[0].sql).toMatch(/^insert into `histories` .* select /);
    expect(executed[0].parameters).toEqual(
      expect.arrayContaining(["owner", "q1"]),
    );
  });
});

describe("HistoryInfra history ids beyond Number.MAX_SAFE_INTEGER", () => {
  const largeId = 9007199254740993n;

  it("returns the inserted id as the same bigint", async () => {
    const { repository } = fakeDatabase(() => ({
      rows: [],
      insertId: largeId,
      numAffectedRows: 1n,
    }));

    await expect(repository.add(history())).resolves.toBe(largeId);
  });

  it("restores History.id exactly from the id read as text", async () => {
    const row = {
      history_id_text: "9007199254740993",
      client_attempt_id: "c382ab80-f895-42a7-9c36-1bba967ef26f",
      qid: "q1",
      uid: "owner",
      judgement: 1,
      pressed_word: 0,
      practiced: new Date("2026-11-16T03:00:00Z"),
      practice_mode: "FREE",
      study_date: "2026-11-16",
      daily_attempt_number: 1,
      previous_judgement: null,
      review_state: "REVIEWING",
      next_review_at: new Date("2026-11-17T03:00:00Z"),
      review_settings_version: 1,
    };
    const query = {
      innerJoin: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      executeTakeFirst: vi.fn().mockResolvedValue(row),
    };
    const client = { selectFrom: vi.fn().mockReturnValue(query) };
    const manager = {
      getClient: () => client,
    } as unknown as KyselyClientManager;

    const found = await new HistoryInfra(manager).findByClientAttemptId(
      "owner",
      "c382ab80-f895-42a7-9c36-1bba967ef26f",
    );

    expect(found?.id).toBe(largeId);
  });
});
