import Category from ".";

export default interface ICategoryRepository {
  findById(id: number): Promise<Category | undefined>,
  findByName(name: string): Promise<Category | undefined>,
  findChainById(id: number): Promise<Category[]>,
  save(category: Category): Promise<void>,
}
