import Level from ".";

export default interface ILevelRepository {
  findAll(): Promise<Level[]>;
}
