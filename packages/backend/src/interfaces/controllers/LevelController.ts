import ILevelRepository from "@/domains/Level/ILevelRepository";
import { typedAsyncWrapper } from "@/utils";

export default class LevelController {
  constructor(
    private levelRepository: ILevelRepository,
  ) {}

  get() {
    return typedAsyncWrapper<"/levels", "get"> (async (req, res) => {
      const levels = await this.levelRepository.findAll();

      res.send(levels.map((level, idx) => ({
        id: idx + 1,
        name: level.name,
        value: level.value,
        color: level.color
      })));
    });
  }
}
