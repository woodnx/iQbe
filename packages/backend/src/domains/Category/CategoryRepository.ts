import Category from ".";

export default interface CategoryRepository {
  findAll(): Promise<Category[] | undefined>,
  save(category: Category): Promise<void>,
}
