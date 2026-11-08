import History from "@/domains/History/index.js";
import HistoryInfra from "./HistoryInfra.js";
import type KyselyClientManager from "./kysely/KyselyClientManager.js";

vi.mock("@/database.js", () => ({ db: {} }));

function failingInsert(error: Error) {
  const insert = {
    values: vi.fn().mockReturnThis(),
    executeTakeFirst: vi.fn().mockRejectedValue(error),
  };
  const lookup = {
    innerJoin: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    executeTakeFirstOrThrow: vi.fn().mockResolvedValue({ id: 1 }),
    executeTakeFirst: vi.fn().mockResolvedValue(undefined),
  };
  const client = {
    selectFrom: vi.fn().mockReturnValue(lookup),
    insertInto: vi.fn().mockReturnValue(insert),
  };
  const manager = { getClient: () => client } as unknown as KyselyClientManager;
  return { repository: new HistoryInfra(manager), lookup };
}

const history = (
  attemptId: string | null = "c382ab80-f895-42a7-9c36-1bba967ef26f",
) => new History("q1", "owner", 0, 1, new Date(), attemptId);

describe("HistoryInfra insert failures", () => {
  it("propagates database failures other than duplicate keys", async () => {
    const error = Object.assign(new Error("connection lost"), {
      code: "PROTOCOL_CONNECTION_LOST",
    });
    const { repository, lookup } = failingInsert(error);
    await expect(repository.add(history())).rejects.toBe(error);
    expect(lookup.executeTakeFirst).not.toHaveBeenCalled();
  });

  it("does not acknowledge a duplicate key without a matching saved attempt", async () => {
    const error = Object.assign(new Error("duplicate key"), {
      code: "ER_DUP_ENTRY",
    });
    const { repository, lookup } = failingInsert(error);
    await expect(repository.add(history())).rejects.toBe(error);
    expect(lookup.where).toHaveBeenCalledWith("users.uid", "=", "owner");
    expect(lookup.executeTakeFirst).toHaveBeenCalledOnce();
  });

  it("does not treat a legacy NULL attempt ID as an idempotency key", async () => {
    const error = Object.assign(new Error("duplicate key"), {
      code: "ER_DUP_ENTRY",
    });
    const { repository, lookup } = failingInsert(error);
    await expect(repository.add(history(null))).rejects.toBe(error);
    expect(lookup.executeTakeFirst).not.toHaveBeenCalled();
  });
});
