import SubCategory from "./index.js";

export default interface SubCategoryRepository {
  findAll(): Promise<SubCategory[] | undefined>;
  save(subCategory: SubCategory): Promise<void>;
}
