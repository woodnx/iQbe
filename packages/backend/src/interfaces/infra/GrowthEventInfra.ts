import type IGrowthEventRepository from "@/domains/GrowthEvent/IGrowthEventRepository.js";
import type GrowthEvent from "@/domains/GrowthEvent/index.js";
import type { GrowthEventType } from "@/domains/GrowthEvent/index.js";
import { sql } from "kysely";
import KyselyClientManager from "./kysely/KyselyClientManager.js";
import { toUnsignedId } from "./kysely/unsignedId.js";

export default class GrowthEventInfra implements IGrowthEventRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async insertAll(events: readonly GrowthEvent[]): Promise<void> {
    const client = this.clientManager.getClient();
    for (const event of events) {
      // user_id・quiz_id を uid・qid から引き直さないのは、履歴と食い違う組を保存し得るため。
      const result = await client
        .insertInto("growth_events")
        .columns(["user_id", "quiz_id", "history_id", "type", "occurred_at"])
        .expression(
          client
            .selectFrom("histories")
            .select([
              "user_id",
              "quiz_id",
              "id",
              sql<GrowthEventType>`${event.type}`.as("type"),
              sql<Date>`${event.occurredAt}`.as("occurred_at"),
            ])
            .where("id", "=", toUnsignedId(event.historyId)),
        )
        .executeTakeFirstOrThrow();
      // 履歴が無いと SELECT が 0 行になり、外部キー違反にならず黙って何も保存されないため。
      if (result.numInsertedOrUpdatedRows !== 1n) {
        throw new Error("The history of a growth event does not exist");
      }
    }
  }

  async listTypesByHistoryId(historyId: bigint): Promise<GrowthEventType[]> {
    // ENUM は定義順で並ぶので、GROWTH_EVENT_TYPES と同じ順になる。
    const rows = await this.clientManager
      .getClient()
      .selectFrom("growth_events")
      .select("type")
      .where("history_id", "=", toUnsignedId(historyId))
      .orderBy("type")
      .execute();
    return rows.map((row) => row.type);
  }
}
