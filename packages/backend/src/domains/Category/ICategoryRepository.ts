import Category from ".";

export default interface CategoryRepository {
  save(category: Category): Promise<void>,
}
