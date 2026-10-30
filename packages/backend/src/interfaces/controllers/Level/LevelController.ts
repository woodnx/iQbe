import ILevelRepository from "@/domains/Level/ILevelRepository.js";
import type { ApiContext } from "@/http/context.js";
import { getLevels } from "./schema.js";

export default class LevelController {
  constructor(private levelRepository: ILevelRepository) {}

  get() {
    return async (c: ApiContext<typeof getLevels>) => {
      const levels = await this.levelRepository.findAll();

      return c.json(
        levels.map((level, idx) => ({
          id: idx + 1,
          name: level.name,
          value: level.value,
          color: level.color,
        })),
        200,
      );
    };
  }
}
