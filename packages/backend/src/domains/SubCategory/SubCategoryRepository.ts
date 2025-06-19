import SubCategory from ".";

export default interface SubCategoryRepository {
  findAll(): Promise<SubCategory[] | undefined>;
  save(subCategory: SubCategory): Promise<void>;
}
