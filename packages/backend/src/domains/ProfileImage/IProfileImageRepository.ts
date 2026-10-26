export default interface IProfileImageRepository {
  save(image: Buffer, filePath: string): Promise<void>;
}
