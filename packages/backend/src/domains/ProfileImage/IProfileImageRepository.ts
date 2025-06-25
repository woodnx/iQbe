export default interface IProfileImageRepository {
  save(image: Express.Multer.File, filePath: string): Promise<void>;
}
