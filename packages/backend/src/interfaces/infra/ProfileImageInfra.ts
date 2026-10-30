import IProfileImageRepository from "@/domains/ProfileImage/IProfileImageRepository.js";

export default class ProfileImageInfra implements IProfileImageRepository {
  async save(image: Buffer, filePath: string): Promise<void> {
    const fileContent = image.toString("utf-8");
  }
}
