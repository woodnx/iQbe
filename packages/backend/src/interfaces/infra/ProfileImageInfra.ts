import IProfileImageRepository from "@/domains/ProfileImage/IProfileImageRepository";

export default class ProfileImageInfra implements IProfileImageRepository {
  async save(image: Express.Multer.File, filePath: string): Promise<void> {
    const fileContent = image.buffer.toString("utf-8");
  }
}
