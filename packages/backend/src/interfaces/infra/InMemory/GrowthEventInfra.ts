import type IGrowthEventRepository from "@/domains/GrowthEvent/IGrowthEventRepository.js";
import type GrowthEvent from "@/domains/GrowthEvent/index.js";
import {
  GROWTH_EVENT_TYPES,
  type GrowthEventType,
} from "@/domains/GrowthEvent/index.js";

export class InMemoryGrowthEventInfra implements IGrowthEventRepository {
  /** 履歴 ID ごとのイベント。 */
  public DB = new Map<bigint, GrowthEvent[]>();

  async insertAll(events: readonly GrowthEvent[]): Promise<void> {
    for (const event of events) {
      const saved = this.DB.get(event.historyId) ?? [];
      this.DB.set(event.historyId, [...saved, event]);
    }
  }

  async listTypesByHistoryId(historyId: bigint): Promise<GrowthEventType[]> {
    const types = (this.DB.get(historyId) ?? []).map((event) => event.type);
    return GROWTH_EVENT_TYPES.filter((type) => types.includes(type));
  }
}
