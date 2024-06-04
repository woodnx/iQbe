import SubCategory from ".";

export default interface SubCategoryRepository {
  findAll(): Promise<SubCategory[] | undefined>,
}