import Level from "./index.js";

export default interface ILevelRepository {
  findAll(): Promise<Level[]>;
}
