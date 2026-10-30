import Level from "@/domains/Level/index.js";
import ILevelRepository from "@/domains/Level/ILevelRepository.js";
import KyselyClientManager from "./kysely/KyselyClientManager.js";

export default class LevelInfra implements ILevelRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async findAll(): Promise<Level[]> {
    const client = this.clientManager.getClient();

    const levels = await client
      .selectFrom("levels")
      .select(["name", "value", "color"])
      .execute();

    return levels.map(
      (level) => new Level(level.value, level.name, level.color),
    );
  }
}
